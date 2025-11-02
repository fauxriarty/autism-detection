import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.VISION_API_BASE!;
const TOKEN = process.env.VISION_API_TOKEN || "";
const TIMEOUT_MS = Number(process.env.VISION_API_TIMEOUT_MS || 12000);

function withTimeout<T>(p: Promise<T>, ms: number, controller?: AbortController) {
  const c = controller ?? new AbortController();
  const t = setTimeout(() => c.abort("timeout"), ms);
  return { done: p.finally(() => clearTimeout(t)) };  // Removed unused 'signal'
}

// POST /api/vision  → forwards image to {BASE}/predict
export async function POST(req: NextRequest) {
  if (!BASE) {
    return NextResponse.json({ error: "VISION_API_BASE not set" }, { status: 500 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "missing file" }, { status: 400 });
    }
    const fwd = new FormData();
    fwd.append("file", file, file.name || "image.jpg");

    const controller = new AbortController();
    const { done } = withTimeout(
      fetch(`${BASE}/predict`, {
        method: "POST",
        body: fwd,
        headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : undefined,
        signal: controller.signal
      }),
      TIMEOUT_MS,
      controller
    );
    const res = await done;
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return NextResponse.json({ error: `upstream ${res.status}`, detail: body }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: unknown) {  // Changed from FormData to unknown
    const status = (e as Error)?.name === "AbortError" ? 504 : 500;
    return NextResponse.json({ error: (e as Error)?.message || "proxy error" }, { status });
  }
}

// GET /api/vision → pass-through health check
export async function GET() {
  if (!BASE) return NextResponse.json({ status: "misconfigured" }, { status: 500 });
  try {
    const res = await fetch(`${BASE}/health`, { cache: "no-store" });
    const data = res.ok ? await res.json() : { status: "down" };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: "down" }, { status: 502 });
  }
}