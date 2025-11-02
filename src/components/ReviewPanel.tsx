"use client";
import { Button } from "@/components/ui/button";

export default function ReviewPanel({
  onConfirm,
  onBack,
}: { onConfirm?: () => void; onBack?: () => void }) {
  return (
    <div className="card space-y-3">
      <p className="text-sm text-muted-foreground">When you’re ready, run the screening. Nothing is uploaded by default.</p>
      <div className="flex gap-3">
        {onBack && <Button variant="outline" onClick={onBack}>Back</Button>}
        <Button onClick={onConfirm}>Run screening</Button>
      </div>
    </div>
  );
}
