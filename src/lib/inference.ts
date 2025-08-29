export type Features = Record<string, number>;
type Model = {
  weights: Record<string, number>;
  bias: number;
  baseline: Record<string, number>;
  thresholds?: { amber: number; red: number };
};

export const demoModel: Model = {
  weights: { q_sum: 0.5, age: -0.02, audio_duration_s: 0.0, audio_size_kb: 0.0, video_duration_s: 0.0, video_size_kb: 0.0 },
  bias: -2.0,
  baseline: { q_sum: 2, age: 5, audio_duration_s: 30, audio_size_kb: 200, video_duration_s: 45, video_size_kb: 1500 },
  thresholds: { amber: 0.33, red: 0.66 },
};

export function inferLocal(model: Model, x: Features) {
  const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
  let logit = model.bias;
  for (const k in model.weights) logit += (model.weights[k] ?? 0) * (x[k] ?? 0);
  const p = sigmoid(logit);
  const shap: Record<string, number> = {};
  for (const k in model.weights) {
    const base = model.baseline[k] ?? 0;
    shap[k] = (model.weights[k] ?? 0) * ((x[k] ?? 0) - base);
  }
  const band = p < (model.thresholds?.amber ?? 0.33) ? "green" : p < (model.thresholds?.red ?? 0.66) ? "amber" : "red";
  return { probability: p, band, shap };
}

export function topFactors(shap: Record<string, number>, k = 5) {
  return Object.entries(shap).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, k).map(([name, value]) => ({ name, value, dir: value >= 0 ? "up" : "down" }));
}
