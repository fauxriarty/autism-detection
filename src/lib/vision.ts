export type VisionResult = {
  label: "YES" | "NO";
  confidence: number;        // 0..1 from your service
  elapsed_ms?: number;
};

export async function inferVisionFromBlob(blob: Blob): Promise<VisionResult> {
  const fd = new FormData();
  // Convert Blob -> File (server expects a filename)
  const file = new File([blob], "photo.jpg", { type: blob.type || "image/jpeg" });
  fd.append("file", file);

  const res = await fetch("/api/vision", { method: "POST", body: fd });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Vision API error ${res.status} ${detail}`);
  }
  const data = await res.json();
  if (!data || (data.label !== "YES" && data.label !== "NO") || typeof data.confidence !== "number") {
    throw new Error("Malformed response from Vision API");
  }
  return data as VisionResult;
}
