import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RiskGauge({ p, band }: { p: number; band: "green"|"amber"|"red" }) {
  const pct = Math.round(p * 100);
  const color = band === "green" ? "bg-green-500" : band === "amber" ? "bg-yellow-500" : "bg-red-500";
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-muted-foreground">Screening risk</div>
        <div className="mt-2 text-3xl font-semibold">{pct}%</div>
        <div className="mt-3 h-2 w-full rounded bg-muted">
          <div className={`h-2 rounded ${color}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2">
          <Badge variant={
            band === "green" ? "success" : 
            band === "amber" ? "warning" : 
            "destructive"
          }>
            {band.toUpperCase()}
          </Badge>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">This is a screening indicator, not a diagnosis.</p>
      </CardContent>
    </Card>
  );
}