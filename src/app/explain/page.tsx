"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExplainPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader><CardTitle>How this screener works</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            The screener uses ten Q-CHAT-10 items (A1–A10) plus age in months, sex, and family history
            to suggest whether a pattern in your answers is more or less consistent with ASD traits in a research dataset.
          </p>
          <p>
            The small model runs locally in your browser by default. No raw media is uploaded unless you opt in.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Interpreting the result</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <span className="text-green-500 font-medium">GREEN</span> — the pattern is less consistent with ASD traits in the dataset.
          </p>
          <p>
            <span className="text-red-500 font-medium">RED</span> — the pattern is more consistent with ASD traits in the dataset.
          </p>
          <p className="text-xs">
            This tool is a screening aid only. If you have concerns, please speak with a qualified clinician.
          </p>
          <div className="pt-2">
            <Button variant="outline" onClick={() => history.back()}>Back to results</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Question reference (A1–A10)</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>A1 – Looks when you call their name</div>
          <div>A6 – Follows where you look</div>
          <div>A2 – Easy to get eye contact</div>
          <div>A7 – Comforts someone upset</div>
          <div>A3 – Points to indicate wants</div>
          <div>A8 – First words were typical</div>
          <div>A4 – Points to share interest</div>
          <div>A9 – Uses simple gestures</div>
          <div>A5 – Pretend play</div>
          <div>A10 – Stares at nothing</div>
        </CardContent>
      </Card>
    </div>
  );
}
