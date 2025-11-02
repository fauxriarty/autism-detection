"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Band = "green" | "red";
type VisionResult = { label: "YES" | "NO"; confidence: number; elapsed_ms?: number } | null;
type Stored = {
  qchat: { prob: number; band: Band; score: number };
  vision: VisionResult;
  drivers: { name: string; dir?: "up" | "down" }[];
  watchouts?: { name: string; dir?: "up" | "down" }[];
} | null;

function Pill({ color, children }: { color: "green" | "red" | "muted"; children: React.ReactNode }) {
  const cls =
    color === "green"
      ? "bg-green-600 text-white"
      : color === "red"
      ? "bg-red-600 text-white"
      : "bg-muted text-foreground";
  return <span className={`px-2.5 py-1 text-xs rounded-full ${cls}`}>{children}</span>;
}

export default function ResultsPage() {
  const [data, setData] = useState<Stored>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("result");
      if (raw) setData(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  if (!data) {
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

  // --- Combine likelihoods (equal weight)
  const qScore = data.qchat?.prob ?? 0;
  const vScore = data.vision
    ? data.vision.label === "YES"
      ? data.vision.confidence
      : 0
    : 0;
  const combined = (qScore + vScore) / 2;
  const band: Band = combined >= 0.5 ? "red" : "green";
  const likelihoodPercent = Math.round(combined * 100);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Model suggestion</CardTitle>
            <Pill color={band}>{band.toUpperCase()}</Pill>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-3xl font-semibold">{likelihoodPercent}% likelihood</div>
          <div className="relative h-3 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full transition-all duration-700 rounded-full ${
                band === "red"
                  ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600"
                  : "bg-gradient-to-r from-green-400 to-emerald-500"
              }`}
              style={{ width: `${likelihoodPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Combines questionnaire and image model predictions with equal weight.  
            This is a screening indicator, not a diagnosis.
          </p>
        </CardContent>
      </Card>

      {data.drivers?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Inputs that most increased the suggestion</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.drivers.slice(0, 8).map((f, i) => (
              <span key={`${f.name}-${i}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-red-900/30 text-red-300 border border-red-800/50">
                ↑ {f.name}
              </span>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Questionnaire</CardTitle>
            <Pill color={data.qchat.band}>{data.qchat.band.toUpperCase()}</Pill>
          </CardHeader>
          <CardContent className="text-sm">
            Q-CHAT score: {data.qchat.score} / 10  
            <br />
            Probability: {(data.qchat.prob * 100).toFixed(1)} %
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Image model</CardTitle>
            <Pill
              color={
                !data.vision
                  ? "muted"
                  : data.vision.label === "YES"
                  ? "red"
                  : "green"
              }
            >
              {!data.vision ? "N/A" : data.vision.label}
            </Pill>
          </CardHeader>
          <CardContent className="text-sm">
            {!data.vision
              ? "No image provided."
              : `Confidence: ${(data.vision.confidence * 100).toFixed(1)} %`}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>What this means</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          {band === "green" ? (
            <p>
              Based on your responses (and image, if provided), fewer indicators associated with autism traits were found.  
              A Q-CHAT score below 3 typically suggests a low likelihood of ASD.
            </p>
          ) : (
            <p>
              Your responses (and/or image) indicate patterns associated with autism traits.  
              A Q-CHAT score of 3 or higher often warrants further discussion with a qualified clinician.
            </p>
          )}
          <div className="pt-1">
            <Button onClick={() => location.assign("/explain")}>Learn more</Button>
            <Button variant="outline" className="ml-2" disabled>
              Download PDF (coming soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
