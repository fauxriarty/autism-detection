"use client";
import { useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle, Check, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = { onReady: (features: Record<string, number>, blob?: Blob) => void };

export default function ImageCapture({ onReady }: Props) {
  type Status = "idle" | "crop" | "confirmed" | "error";
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);

  // cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("please select a valid image file.");
      setStatus("error");
      return;
    }
    const u = URL.createObjectURL(file);
    setPreview(u);
    setLastBlob(file);
    setStatus("crop");
    setError(null);
  }

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

  async function confirmCrop() {
    if (!preview || !croppedAreaPixels) return;
    const blob = await getCroppedImg(preview, croppedAreaPixels);
    if (!blob) return;

    const croppedURL = URL.createObjectURL(blob);
    setPreview(croppedURL);
    setLastBlob(blob);

    const features = {
      image_width: croppedAreaPixels.width,
      image_height: croppedAreaPixels.height,
      image_size_kb: Math.max(1, Math.round(blob.size / 1024)),
    };

    onReady(features, blob);
    setStatus("confirmed");
  }

  function retry(full = true) {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (full) setLastBlob(null);
    setStatus("idle");
    setError(null);
  }

  const hasImage = (status === "crop" || status === "confirmed") && !!preview;

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground text-center px-2">
        {status === "crop"
          ? "adjust the crop area directly on the image and confirm"
          : status === "confirmed"
          ? "image confirmed successfully"
          : "upload a clear photo. make sure their face is centered and well-lit."}
      </div>

      {/* main preview container - only show when image exists */}
      {hasImage || status === "crop" ? (
        <div className="relative aspect-[3/4] sm:aspect-video w-full rounded-xl overflow-hidden border border-muted bg-black">
          <AnimatePresence initial={false} mode="wait">
            {status === "crop" && preview ? (
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
                    containerStyle: { width: "100%", height: "100%" },
                    mediaStyle: { objectFit: "contain" },
                  }}
                />
              </motion.div>
            ) : hasImage && preview ? (
              <motion.img
                key="preview"
                src={preview!}
                alt="uploaded"
                className="h-full w-full object-contain bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            ) : null}
          </AnimatePresence>
        </div>
      ) : (
        <div className="w-full rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10 p-12 flex flex-col items-center justify-center gap-4">
          <Upload className="h-12 w-12 text-muted-foreground/50" />
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">no image uploaded yet</p>
            <p className="text-xs text-muted-foreground/70">click the upload button below to get started</p>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {status === "idle" && (
          <div>
            <input
              id="upload"
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              className="w-full sm:w-auto h-11 px-6"
              onClick={() => document.getElementById("upload")?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> upload photo
            </Button>
          </div>
        )}

        {status === "crop" && (
          <>
            <Button
              variant="outline"
              onClick={() => retry(true)}
              className="w-full sm:w-auto h-11 px-6"
            >
              <X className="mr-2 h-4 w-4" /> cancel
            </Button>
            <Button
              onClick={confirmCrop}
              className="w-full sm:w-auto h-11 px-8 bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="mr-2 h-4 w-4" /> confirm
            </Button>
          </>
        )}

        {status === "confirmed" && (
          <Button
            variant="outline"
            onClick={() => retry(true)}
            className="w-full sm:w-auto h-11 px-6"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> upload another
          </Button>
        )}
      </div>

      {status === "error" && (
        <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error || "an error occurred. please try again."}</span>
        </div>
      )}
    </div>
  );
}
