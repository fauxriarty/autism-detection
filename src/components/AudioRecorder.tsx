"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function AudioRecorder({ onReady }: { onReady: (features: Record<string, number>, blob?: Blob) => void }) {
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef<number | null>(null);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    chunks.current = [];
    startedAt.current = Date.now();
    mr.ondataavailable = (e) => chunks.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      const u = URL.createObjectURL(blob);
      setUrl(u);
      const dur = startedAt.current ? (Date.now() - startedAt.current) / 1000 : 0;
      const features = { audio_duration_s: Math.round(dur), audio_size_kb: Math.round(blob.size / 1024) };
      onReady(features, blob);
      stream.getTracks().forEach(t => t.stop());
    };
    setRec(mr);
    mr.start();
    setTimeout(() => mr.state === "recording" && mr.stop(), 60000);
  }

  function stop() { rec?.state === "recording" && rec.stop(); }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Record 30–60 seconds. You can re-record.</p>
      <div className="flex gap-3">
        <Button onClick={start}>Start</Button>
        <Button variant="outline" onClick={stop}>Stop</Button>
      </div>
      {url && (<audio controls src={url} className="w-full mt-2 rounded-lg border" />)}
    </div>
  );
}
