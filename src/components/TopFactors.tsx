"use client";

export type Item = { label: string; delta?: number; dir?: "up" | "down" };

export default function TopFactors({ items }: { items: Item[] }) {
  if (!items?.length) return null;

  return (
    <div className="card">
      <h3 className="font-semibold mb-2">Top factors</h3>
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 6).map((f, i) => {
          const isUp = f.dir ? f.dir === "up" : (f.delta ?? 0) > 0;
          return (
            <span
              key={i}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                isUp
                  ? "bg-red-500/15 text-red-400"
                  : "bg-emerald-500/15 text-emerald-400"
              }`}
            >
              {isUp ? "↑" : "↓"} {f.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
