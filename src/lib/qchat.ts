"use client";
import * as ort from "onnxruntime-web";

export type Band = "green" | "red";
export type Factor = { name: string; dir: "up" | "down" };

// Define a typed interface for features
export interface Features {
  [key: string]: string | number | undefined;
}

let session: ort.InferenceSession | null = null;
let columns: string[] | null = null;
let meta: { threshold?: number; classes?: string[] } | null = null;

export const A_TEXT: Record<string, string> = {
  A1: "Looks when you call their name",
  A2: "Easy to get eye contact",
  A3: "Points to indicate wants",
  A4: "Points to share interest",
  A5: "Pretend play",
  A6: "Follows where you look",
  A7: "Comforts someone upset",
  A8: "First words were typical",
  A9: "Uses simple gestures",
  A10: "Stares at nothing",
};

// --- Load model and metadata -------------------------------------------------
export async function loadQChat() {
  if (!session) {
    session = await ort.InferenceSession.create("/models/qchat_xgb.onnx", {
      executionProviders: ["wasm"],
    });
    console.log("[QCHAT] inputNames:", session.inputNames);
    console.log("[QCHAT] outputNames:", session.outputNames);
  }
  if (!columns) {
    const res = await fetch("/models/qchat_columns.json");
    columns = await res.json();
    console.log("[QCHAT] columns len:", columns!.length);
  }
  if (!meta) {
    const res = await fetch("/models/qchat_meta.json");
    meta = await res.json().catch(() => ({}));
    console.log("[QCHAT] meta.classes:", meta?.classes);
  }
  return { session, columns: columns!, meta: meta! };
}

// --- Type-safe numeric and categorical helpers ------------------------------
function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function sexM(s: unknown): number {
  return String(s ?? "")
    .trim()
    .toUpperCase()
    .startsWith("M")
    ? 1
    : 0;
}

function yn1(s: unknown): number {
  const v = String(s ?? "").trim().toUpperCase();
  return v === "Y" || v === "YES" || v === "1" ? 1 : 0;
}

// --- Convert user input into ONNX vector ------------------------------------
function vectorize(cols: string[], f: Features): Float32Array {
  const ff: Features = {};
  for (const [k, v] of Object.entries(f)) ff[k.toLowerCase()] = v;

  const x = new Float32Array(cols.length);
  let nnz = 0;

  cols.forEach((c, i) => {
    const lc = c.toLowerCase();
    if (/^a\d+$/.test(lc)) {
      x[i] = num(ff[lc]);
      if (x[i]) nnz++;
    } else if (lc === "age_mons" || lc === "age") {
      x[i] = num(ff["age_mons"] ?? ff["age"]);
      if (x[i]) nnz++;
    } else if (lc === "sex") {
      x[i] = "sex" in ff ? sexM(ff["sex"]) : 0;
      if (x[i]) nnz++;
    } else if (lc === "family_mem_with_asd") {
      const raw = ff["family_mem_with_asd"] ?? ff["family_asd"];
      x[i] = typeof raw === "number" ? raw : yn1(raw);
      if (x[i]) nnz++;
    } else {
      x[i] = 0;
    }
  });

  console.log("[QCHAT] vectorized nnz / len:", nnz, "/", cols.length);
  return x;
}

// --- Output type -------------------------------------------------------------
export interface QChatResult {
  prob: number;
  band: Band;
  probsRaw?: number[];
  labelIdx?: number;
}

// --- Inference ---------------------------------------------------------------
export async function inferQChat(features: Features): Promise<QChatResult> {
  const { session, columns, meta } = await loadQChat();
  if (!columns) throw new Error("Columns not loaded");
  const input = vectorize(columns, features);
  const tensor = new ort.Tensor("float32", input, [1, columns.length]);
  const feeds: Record<string, ort.Tensor> = { [session.inputNames[0]]: tensor };

  const outs = await session.run(feeds);

  // Read probability tensor
  let probs: number[] | null = null;
  for (const [name, t] of Object.entries(outs)) {
    const arr = Array.from(
      (t as ort.Tensor).data as Float32Array | Float64Array
    );
    if (/prob/i.test(name) && arr.length === 2) {
      probs = arr;
      break;
    }
  }
  if (!probs) {
    for (const t of Object.values(outs)) {
      const arr = Array.from(
        (t as ort.Tensor).data as Float32Array | Float64Array
      );
      if (arr.length === 2) {
        probs = arr;
        break;
      }
    }
  }

  // Fallback: use label index
  let labelIdx: number | undefined;
  for (const [name, t] of Object.entries(outs)) {
    if (/label/i.test(name)) {
      const arr = Array.from(
        (t as ort.Tensor).data as Float32Array | Float64Array
      );
      if (arr.length === 1 && (arr[0] === 0 || arr[0] === 1)) labelIdx = arr[0];
    }
  }
  if (labelIdx === undefined) {
    for (const t of Object.values(outs)) {
      const arr = Array.from(
        (t as ort.Tensor).data as Float32Array | Float64Array
      );
      if (arr.length === 1 && (arr[0] === 0 || arr[0] === 1)) {
        labelIdx = arr[0];
        break;
      }
    }
  }

  let pYES = 0;
  if (probs) pYES = probs[1];
  else if (typeof labelIdx === "number") pYES = labelIdx;
  if (!Number.isFinite(pYES)) pYES = 0;

  if (probs && meta?.classes && meta.classes.length === 2) {
    const yesIdx = meta.classes.findIndex((c) => /^yes$/i.test(c));
    if (yesIdx !== 1 && yesIdx !== -1) {
      pYES = probs[yesIdx];
      probs = [probs[1 - yesIdx], probs[yesIdx]];
    }
  }

  const band: Band = pYES >= 0.5 ? "red" : "green";
  console.log("[QCHAT] probs:", probs ?? "(none)");
  console.log("[QCHAT] p selected:", pYES, "band:", band);

  return { prob: pYES, band, probsRaw: probs ?? undefined, labelIdx };
}

// --- Build Q-CHAT score summary ---------------------------------------------
export function buildDrivers(features: Features): {
  drivers: Factor[];
  watchouts: Factor[];
  qchatScore: number;
} {
  const drivers: Factor[] = [];
  const watchouts: Factor[] = [];
  let score = 0;

  for (let i = 1; i <= 10; i++) {
    const key = `A${i}`;
    const v = Number(features[key] ?? 0);
    score += v;
    if (v === 1) {
      drivers.push({ name: `A${i} – ${A_TEXT[key]}`, dir: "up" });
      watchouts.push({ name: `A${i} – ${A_TEXT[key]}`, dir: "up" });
    }
  }

  const familyHistory =
    features["Family_mem_with_ASD"] ?? features["Family_ASD"] ?? 0;
  if (familyHistory === 1) {
    drivers.push({ name: "Family history of ASD", dir: "up" });
  }

  return { drivers, watchouts, qchatScore: score };
}
