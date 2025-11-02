"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Upload, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = { onReady: (features: Record<string, number>, blob?: Blob) => void };

export default function ImageCapture({ onReady }: Props) {
  type Status = "idle" | "live" | "captured" | "error";
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopStream();
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Stop active camera stream
  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  // Start camera
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

  // Capture current frame
  function capture() {
    if (!videoRef.current || !canvasRef.current) return;
    const vw = videoRef.current.videoWidth;
    const vh = videoRef.current.videoHeight;
    if (!vw || !vh) return;

    const cw = 640;
    const ch = Math.round((vh / vw) * cw);
    canvasRef.current.width = cw;
    canvasRef.current.height = ch;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.drawImage(videoRef.current, 0, 0, cw, ch);

    setFlash(true);
    setTimeout(() => setFlash(false), 150);

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

  // Retry/reset
  function retry(full = true) {
    stopStream();
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (full) setLastBlob(null);
    setStatus("idle");
    setError(null);
  }

  // Manual upload fallback
  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const u = URL.createObjectURL(file);
    setPreview(u);
    setLastBlob(file);
    const features = {
      image_width: 640,
      image_height: 480,
      image_size_kb: Math.max(1, Math.round(file.size / 1024)),
    };
    onReady(features, file);
    setStatus("captured");
  }

  const hasImage = status === "captured" && !!preview;

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground text-center">
        {status === "live"
          ? "Align your face in the frame and tap Capture"
          : "Take or upload one clear photo. Keep your face centered and well-lit."}
      </div>

      <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-muted bg-black">
        <AnimatePresence initial={false} mode="wait">
          {!hasImage ? (
            <motion.video
              key="video"
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          ) : (
            <motion.img
              key="preview"
              src={preview!}
              alt="Captured"
              className="h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        {/* Overlay frame (clear face guide) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-[65%] w-[65%] rounded-xl border-2 border-blue-400/70 shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-[1px]" />
        </div>

        {/* Subtle vignette around frame */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40 pointer-events-none" />

        {/* Flash effect */}
        {flash && <div className="absolute inset-0 bg-white/80 animate-pulse pointer-events-none" />}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Control buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {status === "idle" && (
          <>
            <Button onClick={startCamera} className="h-11 px-6">
              <Camera className="mr-2 h-4 w-4" />
              Start Camera
            </Button>
            <div>
              <input
                id="upload"
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="h-11 px-6"
                onClick={() => document.getElementById("upload")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
            </div>
          </>
        )}

        {status === "live" && (
          <Button
            onClick={capture}
            className="h-11 px-8 bg-green-600 hover:bg-green-700 text-white"
          >
            Capture
          </Button>
        )}

        {status === "captured" && (
          <Button
            variant="outline"
            onClick={() => retry(true)}
            className="h-11 px-6"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake
          </Button>
        )}
      </div>

      {/* Status & Error */}
      {hasImage && (
        <div className="text-center text-xs text-muted-foreground">
          Saved photo (~{Math.max(1, Math.round((lastBlob?.size || 0) / 1024))} KB)
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error || "Camera error. Check permissions and retry."}</span>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Tip: Photos are processed locally before upload. Your image isn’t stored after screening.
      </p>
    </div>
  );
}
