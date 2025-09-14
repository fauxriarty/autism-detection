"use client";
import * as ort from "onnxruntime-web";

export type Band = "green" | "amber" | "red";
export type Factor = { name: string; dir: "up" | "down" };

let session: ort.InferenceSession | null = null;
let columns: string[] | null = null;
let meta: { threshold?: number; classes?: string[] } | null = null;

export const A_TEXT: Record<string,string> = {
  A1:  "Looks when you call their name",
  A2:  "Easy to get eye contact",
  A3:  "Points to indicate wants",
  A4:  "Points to share interest",
  A5:  "Pretend play",
  A6:  "Follows where you look",
  A7:  "Comforts someone upset",
  A8:  "First words were typical",
  A9:  "Uses simple gestures",
  A10: "Stares at nothing",
};

export async function loadQChat() {
  if (!session) {
    session = await ort.InferenceSession.create("/models/qchat_xgb.onnx", {
      executionProviders: ["wasm"],
    });
    console.log("[QCHAT] inputNames:", session.inputNames);
    console.log("[QCHAT] outputNames:", session.outputNames);
  }
  if (!columns) {
    columns = await (await fetch("/models/qchat_columns.json")).json();
    console.log("[QCHAT] columns len:", columns!.length);
    console.log("[QCHAT] columns (first 20):", columns!.slice(0,20));
  }
  if (!meta) {
    meta = await (await fetch("/models/qchat_meta.json")).json();
    console.log("[QCHAT] meta.classes:", meta?.classes);
  }
  return { session, columns: columns!, meta: meta! };
}

function num(v: any) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function sexM(s: any) { return String(s ?? "").trim().toUpperCase().startsWith("M") ? 1 : 0; }
function yn1(s: any)  { const v = String(s ?? "").trim().toUpperCase(); return (v==="Y"||v==="YES"||v==="1") ? 1 : 0; }

function vectorize(cols: string[], f: Record<string, any>): Float32Array {
  // Lower-case key lookup for robustness
  const ff: Record<string, any> = {};
  for (const [k,v] of Object.entries(f)) ff[k.toLowerCase()] = v;

  const x = new Float32Array(cols.length);
  let nnz = 0;

  cols.forEach((c, i) => {
    const lc = c.toLowerCase();

    if (/^a\d+$/.test(lc)) {
      // Already encoded by the form as dataset expects (fixed in QuestionnaireForm)
      x[i] = num(ff[lc]);
      if (x[i]) nnz++;
    } else if (lc === "age_mons" || lc === "age") {
      x[i] = num(ff["age_mons"] ?? ff["age"]);
      if (x[i]) nnz++;
    } else if (lc === "sex") {
      // Colab exported model uses 0/1 here (M=1, F=0)
      x[i] = "sex" in ff ? sexM(ff["sex"]) : num(ff["sex"]);
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

export type QChatResult = {
  prob: number;                 // P(ASD = YES)
  band: Band;
  probsRaw?: number[];          // raw [p(NO), p(YES)] when available
};

export async function inferQChat(features: Record<string, any>): Promise<QChatResult> {
  const { session, columns } = await loadQChat();
  const input = vectorize(columns, features);
  const tensor = new ort.Tensor("float32", input, [1, columns.length]);
  const feeds: Record<string, ort.Tensor> = { [session.inputNames[0]]: tensor };

  const outs = await session.run(feeds);

  // Prefer output named like "probabilities"
  let probs: number[] | null = null;
  for (const [name, t] of Object.entries(outs)) {
    const arr = Array.from((t as ort.Tensor).data as Float32Array | Float64Array);
    if (/prob/i.test(name) && arr.length === 2) { probs = arr; break; }
  }
  if (!probs) {
    // Fallback: any 2-length output
    for (const t of Object.values(outs)) {
      const arr = Array.from((t as ort.Tensor).data as Float32Array | Float64Array);
      if (arr.length === 2) { probs = arr; break; }
    }
  }
  if (!probs) {
    // Final fallback: single-value outputs – treat as p(YES)
    for (const t of Object.values(outs)) {
      const arr = Array.from((t as ort.Tensor).data as Float32Array | Float64Array);
      if (arr.length === 1) { probs = [1-arr[0], arr[0]]; break; }
    }
  }

  const pYES = probs ? probs[1] : 0;
  const band: Band = pYES < 0.33 ? "green" : pYES < 0.66 ? "amber" : "red";
  console.log("[QCHAT] probs:", probs ?? "(none)");
  console.log("[QCHAT] p selected:", pYES, "posIdx:", 1);

  return { prob: pYES, band, probsRaw: probs ?? undefined };
}

/** Build human-friendly drivers & watch-outs from the answered questionnaire */
export function buildDrivers(features: Record<string, any>): {
  drivers: Factor[]; watchouts: Factor[]; qchatScore: number;
} {
  const drivers: Factor[] = [];
  const watchouts: Factor[] = [];

  // Q-CHAT score = sum(A1..A10)
  let score = 0;
  for (let i=1;i<=10;i++){
    const key = `A${i}`;
    const v = Number(features[key] ?? 0);
    score += v;
    if (v === 1) {
      // For the screener, a 1 is an atypical response (risk ↑)
      drivers.push({ name: `A${i} – ${A_TEXT[key]}`, dir: "up" });
      watchouts.push({ name: `A${i} – ${A_TEXT[key]}`, dir: "up" });
    }
  }

  // Family history can raise risk in the dataset
  if ((features.Family_mem_with_ASD ?? features.Family_ASD ?? 0) === 1) {
    drivers.push({ name: "Family history of ASD", dir: "up" });
  }
  return { drivers, watchouts, qchatScore: score };
}