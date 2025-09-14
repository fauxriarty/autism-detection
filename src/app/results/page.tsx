"use client";
import { useEffect, useMemo, useState } from "react";
import RiskGauge from "@/components/RiskGauge";
import TopFactors, { type Item } from "@/components/TopFactors";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Factor = { name: string; dir: "up" | "down" };
type Result = {
  probability: number;
  band: "green" | "amber" | "red";
  factors: Factor[];
  watchouts?: Factor[];
  qchatScore?: number;
  answers?: Record<string, any>;
};

export default function ResultsPage() {
  const [data, setData] = useState<Result | null>(null);

  useEffect(() => {
    const s = sessionStorage.getItem("result");
    if (s) {
      try { setData(JSON.parse(s)); } catch {}
    }
  }, []);

  const summary = useMemo(() => {
    if (!data) return "";
    if (data.band === "red") {
      const list = (data.factors ?? []).map(f => f.name.split(" – ")[0]).slice(0,4).join(", ");
      return `Model signals elevated risk driven mainly by: ${list}. Consider consulting a specialist.`;
    }
    if (data.band === "green") {
      const watch = (data.watchouts ?? []).map(f=>f.name.split(" – ")[0]).slice(0,4);
      return watch.length
        ? `Overall low risk. Watch-outs: ${watch.join(", ")}. Consider re-screening if concerns persist.`
        : "Overall low risk based on the current answers.";
    }
    return "Mixed signal. Review the factors below or re-screen after a short interval.";
  }, [data]);

  if (!data) {
    return (
      <div className="card">
        No results yet. <Link href="/screen" className="underline">Start screening</Link>
      </div>
    );
  }

  // Adapt Factor[] -> TopFactors.Item[]
  const items: Item[] = (data.factors ?? []).map(f => ({
    label: f.name,
    dir: f.dir,
    delta: f.dir === "up" ? 1 : -1,
  }));

  return (
    <div className="space-y-6">
      <RiskGauge p={data.probability} band={data.band} />
      <TopFactors items={items} />

      <div className="card">
        <h3 className="font-semibold">What this means</h3>
        <p className="mt-2 text-sm text-muted-foreground">{summary}</p>
        {typeof data.qchatScore === "number" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Q-CHAT score: <span className="font-medium">{data.qchatScore}</span> / 10
          </p>
        )}
        <div className="mt-4 flex gap-3 justify-end">
          <Link href="/explain"><Button>Learn more</Button></Link>
          <Button variant="outline" disabled>Download PDF (coming soon)</Button>
        </div>
      </div>
    </div>
  );
}
