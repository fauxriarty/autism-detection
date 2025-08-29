"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function VideoRecorder(
  { onReady }: { onReady: (features: Record<string, number>, blob?: Blob) => void }
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [playback, setPlayback] = useState<string | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef<number | null>(null);

  useEffect(() => () => { if (playback) URL.revokeObjectURL(playback); }, [playback]);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    if (videoRef.current) videoRef.current.srcObject = stream;

    const mr = new MediaRecorder(stream, { mimeType: "video/webm" });
    chunks.current = [];
    startedAt.current = Date.now();

    mr.ondataavailable = (e) => chunks.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunks.current, { type: "video/webm" });
      const u = URL.createObjectURL(blob);
      setPlayback(u);
      const dur = startedAt.current ? (Date.now() - startedAt.current) / 1000 : 0;
      const features = { video_duration_s: Math.round(dur), video_size_kb: Math.round(blob.size / 1024) };
      onReady(features, blob);
      stream.getTracks().forEach(t => t.stop());
    };

    setRecorder(mr);
    mr.start();
    setTimeout(() => { if (mr.state === "recording") mr.stop(); }, 45000);
  }

  function stop() {
    if (recorder && recorder.state === "recording") recorder.stop();
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Follow the dot / look at camera for ~45s.</p>
      <video ref={videoRef} autoPlay muted playsInline className="w-full rounded-lg border" />
      <div className="flex gap-3">
        <Button onClick={start}>Start</Button>
        <Button variant="outline" onClick={stop}>Stop</Button>
      </div>
      {playback && <video src={playback} controls className="w-full rounded-lg border" />}
    </div>
  );
}
