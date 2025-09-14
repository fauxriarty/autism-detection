"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Band = "green" | "red";
type Factor = { name: string; dir?: "up" | "down" };
type Stored =
  | { probability?: number; prob?: number; band?: Band | "amber"; factors?: Factor[]; drivers?: Factor[]; qchatScore?: number; }
  | null;

export default function ResultsPage() {
  const [payload, setPayload] = useState<Stored>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("result");
      if (raw) setPayload(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  if (!payload) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 space-y-3">
            <p>No results yet.</p>
            <Button onClick={() => location.assign("/screen")}>Start screening</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const prob = (payload.probability ?? payload.prob);
  const band: Band =
    payload?.band === "red" || payload?.band === "green"
      ? (payload.band as Band)
      : (Number(prob) >= 0.5 ? "red" : "green");

  const chips = (payload.drivers ?? payload.factors ?? []) as Factor[];
  const badge = band === "green" ? "bg-green-600 text-white" : "bg-red-600 text-white";
  const headline = band === "green" ? "Low likelihood pattern" : "Elevated likelihood pattern";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Binary suggestion */}
      <Card>
        <CardHeader>
          <CardTitle>Model suggestion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">{headline}</div>
            <span className={`px-2.5 py-1 text-xs rounded-full ${badge}`}>
              {band.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            This is a screening aid based on patterns in a research dataset. It is not a diagnosis.
          </p>
        </CardContent>
      </Card>

      {/* Key inputs */}
      {chips.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Key inputs from your answers</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {chips.slice(0, 8).map((f, i) => (
              <span
                key={`${f.name}-${i}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-red-900/30 text-red-300 border border-red-800/50"
                title="Contributed toward the model’s YES vote"
              >
                ↑ {f.name}
              </span>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Guidance */}
      <Card>
        <CardHeader><CardTitle>What to consider</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          {band === "green" ? (
            <>
              <p>The current answers suggest a lower likelihood of ASD traits in the dataset.</p>
              {chips.length > 0 && (
                <p className="text-muted-foreground">
                  The highlighted items stood out. You can treat them as watch-outs and re-screen if concerns persist.
                </p>
              )}
            </>
          ) : (
            <>
              <p>The current answers suggest a higher likelihood of ASD traits in the dataset.</p>
              <p className="text-muted-foreground">
                Consider discussing results with a qualified clinician, especially if concerns are ongoing.
              </p>
            </>
          )}
          <div className="pt-1">
            <Button onClick={() => location.assign("/explain")}>Learn more</Button>
            <Button variant="outline" className="ml-2" disabled>Download PDF (coming soon)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
