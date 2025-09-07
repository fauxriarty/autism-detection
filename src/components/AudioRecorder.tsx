"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, RotateCcw, AlertCircle } from "lucide-react";

type Props = { onReady: (features: Record<string, number>, blob?: Blob) => void };

export default function AudioRecorder({ onReady }: Props) {
  type Status = "idle" | "recording" | "recorded" | "error";
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [url, setUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [lastFeatures, setLastFeatures] = useState<Record<string, number> | null>(null);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);

  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<number | null>(null);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
      stopAllTracks();
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [url]);

  function stopAllTracks() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function formatTime(s: number) {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }

  async function start() {
    try {
      setError(null);
      // ensure clean state before starting
      discard(true);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream);
      recRef.current = mr;
      chunksRef.current = [];
      startedAt.current = Date.now();
      setElapsed(0);
      setStatus("recording");

      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setLastBlob(blob);
        const u = URL.createObjectURL(blob);
        setUrl(u);

        const dur = startedAt.current ? Math.max(0, Math.round((Date.now() - startedAt.current) / 1000)) : 0;
        const features = { audio_duration_s: dur, audio_size_kb: Math.round(blob.size / 1024) };
        setLastFeatures(features);
        onReady(features, blob);

        if (tickRef.current) window.clearInterval(tickRef.current);
        stopAllTracks();
        setStatus("recorded");
      };

      tickRef.current = window.setInterval(() => {
        if (startedAt.current) setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
      }, 200);

      mr.start();
      // hard stop at 60s
      window.setTimeout(() => {
        if (recRef.current?.state === "recording") stop();
      }, 60000);
    } catch (e: any) {
      setStatus("error");
      setError(e?.message || "Microphone access failed.");
      stopAllTracks();
    }
  }

  function stop() {
    if (recRef.current?.state === "recording") recRef.current.stop();
  }

  // FULL reset (used by Retry and before a new Start)
  function discard(clearParent = false) {
    if (recRef.current?.state === "recording") recRef.current.stop();
    stopAllTracks();
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    setLastBlob(null);
    setLastFeatures(clearParent ? null : lastFeatures); // when starting fresh we pass true
    if (tickRef.current) window.clearInterval(tickRef.current);
    startedAt.current = null;
    setElapsed(0);
    setStatus("idle");
  }

  const isRecording = status === "recording";
  const hasTake = status === "recorded" && !!url;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Record <span className="font-medium">30–60 seconds</span>. You can preview and re-record.
        </span>
        <span className="badge">{isRecording ? "Recording…" : hasTake ? "Saved" : "Idle"}</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="text-2xl font-semibold tabular-nums">
          {formatTime(isRecording ? elapsed : hasTake ? (lastFeatures?.audio_duration_s || 0) : 0)}
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={start} disabled={isRecording} className="h-11 px-5">
            <Mic className="mr-2 h-4 w-4" />
            {isRecording ? "Recording…" : "Start"}
          </Button>
          <Button variant="outline" onClick={stop} disabled={!isRecording} className="h-11 px-5">
            <Square className="mr-2 h-4 w-4" />
            Stop
          </Button>
          <Button variant="outline" onClick={() => discard(true)} disabled={isRecording && !hasTake} className="h-11 px-5">
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>

      {url && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Preview</div>
          <audio controls src={url} className="w-full rounded-lg border" />
          <div className="text-xs text-muted-foreground">
            Size ~{Math.max(1, Math.round((lastBlob?.size || 0) / 1024))} KB • Duration {formatTime(lastFeatures?.audio_duration_s || 0)}
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="card">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Microphone permission denied or not available. Check browser settings and retry.</span>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Tip: Nothing is uploaded by default. Audio stays on your device unless you opt in elsewhere.
      </p>
    </div>
  );
}
