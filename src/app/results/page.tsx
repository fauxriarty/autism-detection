"use client";
import { useEffect, useState } from "react";
import RiskGauge from "@/components/RiskGauge";
import TopFactors from "@/components/TopFactors";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Factor = { name: string; value: number; dir: "up" | "down" };
type Result = { probability: number; band: "green"|"amber"|"red"; factors: Factor[] };

export default function ResultsPage() {
  const [data, setData] = useState<Result | null>(null);
  useEffect(() => { const s = sessionStorage.getItem("result"); if (s) setData(JSON.parse(s)); }, []);
  
  if (!data) return (
    <div className="card">
      No results yet. <Link href="/screen" className="underline">Start screening</Link>
    </div>
  );
  
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
          <Link href="/explain">
            <Button variant="default">
              Learn more
            </Button>
          </Link>
          <Button variant="outline" disabled>
            Download PDF (coming soon)
          </Button>
        </div>
      </div>
    </div>
  );
}