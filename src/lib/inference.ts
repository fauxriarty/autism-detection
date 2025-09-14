"use client";
import * as ort from "onnxruntime-web";

let session: ort.InferenceSession | null = null;
let modelColumns: string[] = [];
let meta: { threshold?: number; classes?: string[] } | null = null;

function yn1(s: any) {
  const v = String(s ?? "").trim().toUpperCase();
  return v === "Y" || v === "YES" || v === "1" ? 1 : 0;
}
function sexM(s: any) {
  const v = String(s ?? "").trim().toUpperCase();
  return v.startsWith("M") ? 1 : 0;
}
function num(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function ensureLoaded() {
  if (!modelColumns.length) {
    const r = await fetch("/models/qchat_columns.json");
    modelColumns = await r.json();
  }
  if (!meta) {
    meta = await (await fetch("/models/qchat_meta.json")).json().catch(() => ({}));
  }
  if (!session) {
    session = await ort.InferenceSession.create("/models/qchat_xgb.onnx", {
      executionProviders: ["wasm"],
    });
  }
}

function vectorize(features: Record<string, any>): Float32Array {
  const f: Record<string, any> = {};
  for (const [k, v] of Object.entries(features)) f[k.toLowerCase()] = v;

  const eth = String(f["ethnicity"] ?? "").trim().toLowerCase();
  const who = String(f["who_completed_the_test"] ?? "").trim().toLowerCase();

  const x = new Float32Array(modelColumns.length);
  modelColumns.forEach((col, i) => {
    const lc = col.toLowerCase();

    if (lc === "age_mons" || lc === "age") {
      x[i] = num(f["age_mons"] ?? f["age"]);
    } else if (/^a\d+$/.test(lc)) {
      x[i] = num(f[lc]); // A1..A10
    } else if (lc === "sex_m" || lc === "sex") {
      x[i] = "sex" in f ? sexM(f["sex"]) : num(f["sex_m"]);
    } else if (lc === "jaundice_yes" || lc === "jaundice") {
      x[i] = "jaundice" in f ? yn1(f["jaundice"]) : num(f["jaundice_yes"]);
    } else if (
      lc === "family_asd_yes" ||
      lc === "family_mem_with_asd_yes" ||
      lc === "family_mem_with_asd" ||
      lc === "family_asd"
    ) {
      const raw =
        f["family_asd"] ??
        f["family_mem_with_asd"] ??
        f["family_mem_with_asd_yes"];
      x[i] = raw === undefined ? 0 : (typeof raw === "number" ? raw : yn1(raw));
    } else if (lc.startsWith("ethnicity_")) {
      const cat = col.slice("Ethnicity_".length).trim().toLowerCase();
      x[i] = eth && cat === eth ? 1 : 0;
    } else if (lc.startsWith("who_completed_the_test_")) {
      const cat = col.slice("Who_completed_the_test_".length).trim().toLowerCase();
      x[i] = who && cat === who ? 1 : 0;
    } else {
      x[i] = 0;
    }
  });
  return x;
}

export type InferenceResult = {
  probability: number;
  band: "green" | "amber" | "red";
  factors: { name: string; value: number; dir: "up" | "down" }[];
};

export async function runInference(features: Record<string, any>): Promise<InferenceResult> {
  await ensureLoaded();
  const input = vectorize(features);

  const tensor = new ort.Tensor("float32", input, [1, modelColumns.length]);
  const feeds: Record<string, ort.Tensor> = { [session!.inputNames[0]]: tensor };
  const outputs = await session!.run(feeds);

  let p = NaN;
  // Prefer tensor with 'prob' in its name (exporters name it like 'output_probability')
  for (const [name, t] of Object.entries(outputs)) {
    const arr = (t as ort.Tensor).data as Float32Array | Float64Array;
    if (/prob/i.test(name)) {
      p = arr.length === 2 ? Number(arr[1]) : Number(arr[0]);
      break;
    }
  }
  // Fallback: any 2-class vector → take index 1
  if (!Number.isFinite(p)) {
    for (const t of Object.values(outputs)) {
      const arr = (t as ort.Tensor).data as Float32Array | Float64Array;
      if (arr.length === 2) { p = Number(arr[1]); break; }
      if (arr.length === 1) { p = Number(arr[0]); }
    }
  }
  if (!Number.isFinite(p)) p = 0;

  const band: "green" | "amber" | "red" = p < 0.33 ? "green" : p < 0.66 ? "amber" : "red";

  const factors = [
    { name: "Age_Mons", value: num(features.Age_Mons), dir: "up" as const },
    { name: "A2", value: num(features.A2), dir: "down" as const },
    { name: "A9", value: num(features.A9), dir: "down" as const },
  ];

  return { probability: p, band, factors };
}
