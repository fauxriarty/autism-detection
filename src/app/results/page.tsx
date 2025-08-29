"use client";
import { useEffect, useState } from "react";
import RiskGauge from "@/components/RiskGauge";
import TopFactors from "@/components/TopFactors";

type Factor = { name: string; value: number; dir: "up" | "down" };
type Result = { probability: number; band: "green"|"amber"|"red"; factors: Factor[] };

export default function ResultsPage() {
  const [data, setData] = useState<Result | null>(null);
  useEffect(() => { const s = sessionStorage.getItem("result"); if (s) setData(JSON.parse(s)); }, []);
  if (!data) return <div className="card">No results yet. <a className="underline" href="/screen">Start screening</a></div>;
  return (
    <div className="space-y-6">
      <RiskGauge p={data.probability} band={data.band} />
      <TopFactors items={data.factors} />
      <div className="card">
        <h3 className="font-semibold">What this means</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          This is a screening indicator. If the risk is Amber/Red, consider consulting a specialist.
        </p>
        <div className="mt-4 flex gap-3">
          <a className="btn" href="/explain">Learn more</a>
          <button className="btn" disabled>Download PDF (coming soon)</button>
        </div>
      </div>
    </div>
  );
}
