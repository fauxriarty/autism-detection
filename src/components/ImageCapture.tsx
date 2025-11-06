"use client";
import { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Upload, AlertCircle, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = { onReady: (features: Record<string, number>, blob?: Blob) => void };

export default function ImageCapture({ onReady }: Props) {
  type Status = "idle" | "live" | "crop" | "confirmed" | "error";
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // ---- Start camera
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
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Camera access failed.");
    }
  }

  // ---- Capture from camera
  function capture() {
    if (!videoRef.current || !canvasRef.current) return;
    const vw = videoRef.current.videoWidth;
    const vh = videoRef.current.videoHeight;
    if (!vw || !vh) return;

    const cw = 720;
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
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setStatus("crop");
      },
      "image/jpeg",
      0.92
    );
  }

  // ---- Upload from file
  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const u = URL.createObjectURL(file);
    setPreview(u);
    setLastBlob(file);
    setStatus("crop");
  }

  // ---- Convert cropped area to blob
  async function getCroppedImg(imageSrc: string, cropPixels: any): Promise<Blob | null> {
    const img = new Image();
    img.src = imageSrc;
    await new Promise((r) => (img.onload = r));

    const canvas = document.createElement("canvas");
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
      img,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );

    return new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
    );
  }

  // ---- Confirm crop
  async function confirmCrop() {
    if (!preview || !croppedAreaPixels) return;
    const blob = await getCroppedImg(preview, croppedAreaPixels);
    if (!blob) return;

    const features = {
      image_width: croppedAreaPixels.width,
      image_height: croppedAreaPixels.height,
      image_size_kb: Math.max(1, Math.round(blob.size / 1024)),
    };
    onReady(features, blob);
    setLastBlob(blob);
    setStatus("confirmed");
  }

  // ---- Retry
  function retry(full = true) {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (full) setLastBlob(null);
    setStatus("idle");
    setError(null);
  }

  const hasImage = (status === "crop" || status === "confirmed") && !!preview;

  // ---- Render
  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground text-center px-2 sm:px-0">
        {status === "live"
          ? "Align your face and tap Capture"
          : status === "crop"
          ? "Adjust crop directly on the image and confirm"
          : status === "confirmed"
          ? "Image confirmed successfully"
          : "Take or upload one clear photo. Keep your face centered and well-lit."}
      </div>

      {/* Video or Crop Preview */}
      <div className="relative aspect-[3/4] sm:aspect-video w-full rounded-xl overflow-hidden border border-muted bg-black">
        <AnimatePresence initial={false} mode="wait">
          {status === "live" ? (
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
          ) : status === "crop" && preview ? (
            <motion.div
              key="crop"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Cropper
                image={preview}
                crop={crop}
                zoom={zoom}
                aspect={3 / 4}
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedPixels) =>
                  setCroppedAreaPixels(croppedPixels)
                }
                cropShape="rect"
                style={{
                  containerStyle: {
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                  },
                  mediaStyle: { objectFit: "contain" },
                }}
              />
            </motion.div>
          ) : hasImage && preview ? (
            <motion.img
              key="preview"
              src={preview!}
              alt="Captured"
              className="h-full w-full object-contain bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          ) : null}
        </AnimatePresence>

        {status === "live" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-[75%] w-[75%] sm:h-[65%] sm:w-[65%] rounded-xl border-2 border-blue-400/70 shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
          </div>
        )}

        {flash && (
          <div className="absolute inset-0 bg-white/80 animate-pulse pointer-events-none" />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {status === "idle" && (
          <>
            <Button onClick={startCamera} className="w-full sm:w-auto h-11 px-6">
              <Camera className="mr-2 h-4 w-4" /> Start Camera
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
                className="w-full sm:w-auto h-11 px-6"
                onClick={() => document.getElementById("upload")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" /> Upload Photo
              </Button>
            </div>
          </>
        )}

        {status === "live" && (
          <Button
            onClick={capture}
            className="w-full sm:w-auto h-11 px-8 bg-green-600 hover:bg-green-700 text-white"
          >
            Capture
          </Button>
        )}

        {status === "crop" && (
          <>
            <Button
              variant="outline"
              onClick={() => retry(true)}
              className="w-full sm:w-auto h-11 px-6"
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button
              onClick={confirmCrop}
              className="w-full sm:w-auto h-11 px-8 bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="mr-2 h-4 w-4" /> Confirm
            </Button>
          </>
        )}

        {status === "confirmed" && (
          <Button
            variant="outline"
            onClick={() => retry(true)}
            className="w-full sm:w-auto h-11 px-6"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Retake
          </Button>
        )}
      </div>

      {status === "error" && (
        <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error || "Camera error. Check permissions and retry."}</span>
        </div>
      )}
    </div>
  );
}
