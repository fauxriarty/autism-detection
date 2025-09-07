"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video as VideoIcon, Square, RotateCcw, AlertCircle } from "lucide-react";

type Props = { onReady: (features: Record<string, number>, blob?: Blob) => void };

export default function VideoRecorder({ onReady }: Props) {
  type Status = "idle" | "recording" | "recorded" | "error";
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<number | null>(null);
  const startedAt = useRef<number | null>(null);

  const [elapsed, setElapsed] = useState(0);
  const [playback, setPlayback] = useState<string | null>(null);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);
  const [lastFeatures, setLastFeatures] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    return () => {
      cleanupMedia();
      if (playback) URL.revokeObjectURL(playback);
    };
  }, [playback]);

  function cleanupMedia() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (tickRef.current) window.clearInterval(tickRef.current);
  }

  function formatTime(s: number) {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function pickMime() {
    const c = (t: string) =>
      // @ts-ignore
      typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(t);
    // Safari prefers MP4; Chromium prefers WebM
    if (c("video/mp4")) return "video/mp4";
    if (c("video/webm;codecs=vp9,opus")) return "video/webm;codecs=vp9,opus";
    if (c("video/webm;codecs=vp8,opus")) return "video/webm;codecs=vp8,opus";
    if (c("video/webm")) return "video/webm";
    return ""; // let the browser decide
  }

  async function start() {
    try {
      setError(null);
      retry(true); // FULL reset

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      const mimeType = pickMime();
      const opts: MediaRecorderOptions = {};
      if (mimeType) opts.mimeType = mimeType;
      // reduce bitrate to keep file size small but usable
      (opts as any).videoBitsPerSecond = 2_000_000;

      const mr = new MediaRecorder(stream, opts);
      recRef.current = mr;
      chunksRef.current = [];
      startedAt.current = Date.now();
      setElapsed(0);
      setStatus("recording");

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        // if we somehow have nothing, bail with a helpful message
        if (chunksRef.current.length === 0) {
          setStatus("error");
          setError(
            "No data was captured. This can happen if the browser doesn't support the chosen codec. Try Retry and record again."
          );
          cleanupMedia();
          return;
        }

        const type = mimeType || "video/webm";
        const blob = new Blob(chunksRef.current, { type });
        setLastBlob(blob);
        const u = URL.createObjectURL(blob);
        setPlayback(u);

        const dur = startedAt.current ? Math.max(0, Math.round((Date.now() - startedAt.current) / 1000)) : 0;
        const features = { video_duration_s: dur, video_size_kb: Math.round(blob.size / 1024) };
        setLastFeatures(features);
        onReady(features, blob); // hand off to wizard

        cleanupMedia();
        setStatus("recorded");
      };

      // Use a timeslice so we actually get chunks (fixes "empty blob" on some browsers)
      mr.start(1000); // ms
      // 45s auto-stop
      window.setTimeout(() => {
        if (recRef.current?.state === "recording") stop();
      }, 45_000);

      // simple timer
      tickRef.current = window.setInterval(() => {
        if (startedAt.current) setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
      }, 200);
    } catch (e: any) {
      setStatus("error");
      setError(e?.message || "Camera access failed.");
      cleanupMedia();
    }
  }

  function stop() {
    if (recRef.current?.state === "recording") {
      // Flush the last chunk before stopping (fixes missing preview)
      try {
        recRef.current.requestData();
      } catch {}
      recRef.current.stop();
    }
  }

  function retry(full = true) {
    if (recRef.current?.state === "recording") recRef.current.stop();
    cleanupMedia();
    if (videoRef.current) videoRef.current.srcObject = null;
    if (playback) URL.revokeObjectURL(playback);
    setPlayback(null);
    if (full) {
      setLastBlob(null);
      setLastFeatures(null);
    }
    startedAt.current = null;
    setElapsed(0);
    setStatus("idle");
    setError(null);
  }

  const isRecording = status === "recording";
  const hasTake = status === "recorded" && !!playback;
  const progressPct = Math.min(100, Math.round((elapsed / 45) * 100));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Record <span className="font-medium">~45 seconds</span>. Keep your face centered and look at the camera.
        </p>
        <ul className="text-xs text-muted-foreground list-disc pl-5">
          <li>Good light in front of you (avoid backlight).</li>
          <li>Stay within the frame; sit still and look forward.</li>
        </ul>
      </div>

      <div className="relative">
        <div className="aspect-video w-full overflow-hidden rounded-lg border">
          {!hasTake ? (
            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
          ) : (
            <video src={playback!} controls playsInline className="h-full w-full object-cover" />
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[70%] w-[70%] rounded-lg border border-white/20"></div>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="badge">{isRecording ? "Recording…" : hasTake ? "Saved" : "Idle"}</span>
          <span className="text-2xl font-semibold tabular-nums">
            {formatTime(isRecording ? elapsed : hasTake ? (lastFeatures?.video_duration_s || 0) : 0)}
          </span>
        </div>

        <div className="flex-1 min-w-[220px] max-w-[420px]">
          <div className="h-1.5 rounded bg-muted">
            <div className="h-1.5 rounded" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Target ~00:45</div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={start} disabled={isRecording} className="h-11 px-5">
            <VideoIcon className="mr-2 h-4 w-4" />
            {isRecording ? "Recording…" : "Start"}
          </Button>
          <Button variant="outline" onClick={stop} disabled={!isRecording} className="h-11 px-5">
            <Square className="mr-2 h-4 w-4" />
            Stop
          </Button>
          <Button variant="outline" onClick={() => retry(true)} disabled={isRecording && !hasTake} className="h-11 px-5">
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>

      {hasTake && (
        <div className="text-xs text-muted-foreground">
          Saved take: ~{Math.max(1, Math.round((lastBlob?.size || 0) / 1024))} KB • Duration {formatTime(lastFeatures?.video_duration_s || 0)}
        </div>
      )}

      {status === "error" && (
        <div className="card">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              {error || "Camera error. Check browser permissions and retry."}
            </span>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Tip: Nothing is uploaded by default. Video stays on your device unless you opt in elsewhere.
      </p>
    </div>
  );
}
