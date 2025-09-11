"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, AlertCircle } from "lucide-react";

type Props = { onReady: (features: Record<string, number>, blob?: Blob) => void };

export default function ImageCapture({ onReady }: Props) {
  type Status = "idle" | "live" | "captured" | "error";
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);

  useEffect(() => {
    return () => {
      stopStream();
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startCamera() {
    try {
      setError(null);
      retry(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setStatus("live");
    } catch (e: any) {
      setStatus("error");
      setError(e?.message || "Camera access failed.");
    }
  }

  function capture() {
    if (!videoRef.current || !canvasRef.current) return;
    const vw = videoRef.current.videoWidth;
    const vh = videoRef.current.videoHeight;
    if (!vw || !vh) return;

    // Draw current frame to canvas
    const cw = 640;
    const ch = Math.round((vh / vw) * cw);
    canvasRef.current.width = cw;
    canvasRef.current.height = ch;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.drawImage(videoRef.current, 0, 0, cw, ch);

    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) return;
        setLastBlob(blob);
        const u = URL.createObjectURL(blob);
        setPreview(u);

        const features = {
          image_width: cw,
          image_height: ch,
          image_size_kb: Math.max(1, Math.round(blob.size / 1024)),
        };
        onReady(features, blob);

        stopStream();
        setStatus("captured");
      },
      "image/jpeg",
      0.92
    );
  }

  function retry(full = true) {
    stopStream();
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (full) setLastBlob(null);
    setStatus("idle");
    setError(null);
  }

  const hasImage = status === "captured" && !!preview;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Take one clear photo. Keep your face centered; good light in front of you.
        </p>
      </div>

      <div className="relative">
        <div className="aspect-video w-full overflow-hidden rounded-lg border">
          {!hasImage ? (
            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
          ) : (
            <img src={preview!} alt="Captured" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[70%] w-[70%] rounded-lg border border-white/20"></div>
        </div>
      </div>

      {/* hidden canvas used for capture */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="badge">
            {status === "live" ? "Camera on" : hasImage ? "Captured" : "Idle"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={startCamera} disabled={status === "live"} className="h-11 px-5">
            <Camera className="mr-2 h-4 w-4" />
            {status === "live" ? "Camera on" : "Start camera"}
          </Button>
          <Button variant="outline" onClick={capture} disabled={status !== "live"} className="h-11 px-5">
            Capture
          </Button>
          <Button variant="outline" onClick={() => retry(true)} disabled={status === "live" && !hasImage} className="h-11 px-5">
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake
          </Button>
        </div>
      </div>

      {hasImage && (
        <div className="text-xs text-muted-foreground">
          Saved photo ~{Math.max(1, Math.round((lastBlob?.size || 0) / 1024))} KB
        </div>
      )}

      {status === "error" && (
        <div className="card">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error || "Camera error. Check permissions and retry."}</span>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Tip: Nothing is uploaded by default. Images stay on your device unless you opt in elsewhere.
      </p>
    </div>
  );
}
