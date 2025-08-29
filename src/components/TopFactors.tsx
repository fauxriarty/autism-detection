import { Card, CardContent } from "@/components/ui/card";
export default function TopFactors({ items }: { items: {name:string, value:number, dir:"up"|"down"}[] }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm font-medium">Top factors</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((f) => (
            <span key={f.name} className="badge">{f.dir === "up" ? "↑" : "↓"} {f.name}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
