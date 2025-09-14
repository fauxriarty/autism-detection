"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ExplainPage() {
  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="card">
        <h2 className="text-xl font-semibold">About this screener</h2>
        <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Inputs:</span>{" "}
            10 short Q-CHAT questions (A1–A10), age in months, sex, and whether there’s an immediate family
            member with ASD.
          </li>
          <li>
            <span className="font-medium text-foreground">Local inference:</span>{" "}
            a tiny model runs completely in your browser using ONNX Runtime Web. No answers are uploaded by default.
          </li>
          <li>
            <span className="font-medium text-foreground">Interpretation:</span>{" "}
            we show which answers most influenced the score (the “Top factors” chips).
          </li>
          <li>
            This is a screening indicator, not a diagnosis. If you have concerns, consult a qualified clinician.
          </li>
        </ul>
        <div className="mt-4">
          <Link href="/results">
            <Button variant="secondary">Back to results</Button>
          </Link>
        </div>
      </div>

      {/* What we feed the model */}
      <div className="card">
        <h3 className="font-semibold">What the model sees</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your answers are converted into a fixed vector of 13 numbers, in this exact order:
        </p>
        <div className="mt-3 grid gap-2 text-sm">
          <div className="rounded-md border px-3 py-2 bg-background">
            <code className="whitespace-pre-wrap break-words">
              [ A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, Age_Mons, Sex, Family_mem_with_ASD ]
            </code>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li><span className="text-foreground font-medium">A1–A10</span>: each is 0 or 1 based on the question’s Yes/No choice.</li>
            <li><span className="text-foreground font-medium">Age_Mons</span>: age in months (e.g., 24, 36).</li>
            <li><span className="text-foreground font-medium">Sex</span>: M = 1, F = 0.</li>
            <li><span className="text-foreground font-medium">Family_mem_with_ASD</span>: Yes = 1, No = 0.</li>
          </ul>
        </div>
      </div>

      {/* How the score is computed */}
      <div className="card">
        <h3 className="font-semibold">How the score is computed</h3>
        <ol className="mt-2 list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
          <li>Your 13-value vector is fed into a gradient-boosted decision-tree model exported to ONNX.</li>
          <li>The model outputs a two-number vector: <code>[ p(NO), p(YES) ]</code>.</li>
          <li>We report <code>p(YES)</code> as the “screening risk”.</li>
          <li>For the colored band, we map probability to:
            <ul className="list-disc pl-5 mt-1">
              <li><span className="text-emerald-400 font-medium">Green</span>: p &lt; 0.33</li>
              <li><span className="text-amber-400 font-medium">Amber</span>: 0.33 ≤ p &lt; 0.66</li>
              <li><span className="text-red-400 font-medium">Red</span>: p ≥ 0.66</li>
            </ul>
          </li>
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">
          Why might you see 0% or 100%? Tree models create sharp decision regions. On this small dataset, many answer
          patterns fall clearly into one region, which can yield very confident probabilities. That does not mean
          certainty—just high model confidence for this pattern.
        </p>
      </div>

      {/* Top factors explanation */}
      <div className="card">
        <h3 className="font-semibold">What “Top factors” mean</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          For each feature, we simulate a small change and re-run the model to measure how much the probability would
          move. For questions (A1–A10), we flip 0↔1. For age, we nudge by ~6 months toward the center of typical
          screening ages. Chips labelled with <span className="text-red-400 font-semibold">↑</span> increased risk;{" "}
          <span className="text-emerald-400 font-semibold">↓</span> decreased risk. The percent shows the size of that
          change. This provides a straightforward, per-answer explanation of your score.
        </p>
      </div>

      {/* Interpreting your result */}
      <div className="card">
        <h3 className="font-semibold">Interpreting your result</h3>
        <div className="mt-3 grid gap-3 text-sm">
          <div className="rounded-md border p-3">
            <div className="font-medium text-emerald-400">If the band is GREEN</div>
            <p className="mt-1 text-muted-foreground">
              The model indicates low risk based on the current answers. If some factors still show{" "}
              <span className="text-red-400 font-medium">↑</span>, treat them as early watch-outs and consider
              re-screening if concerns persist.
            </p>
          </div>
          <div className="rounded-md border p-3">
            <div className="font-medium text-amber-400">If the band is AMBER</div>
            <p className="mt-1 text-muted-foreground">
              The signal is mixed. Review the top factors and consider speaking with a clinician or repeating the screen
              after a short interval.
            </p>
          </div>
          <div className="rounded-md border p-3">
            <div className="font-medium text-red-400">If the band is RED</div>
            <p className="mt-1 text-muted-foreground">
              The model found a pattern strongly associated with ASD traits in the dataset. This is not a diagnosis;
              use it to inform a conversation with a qualified professional.
            </p>
          </div>
        </div>
      </div>

      {/* Data dictionary */}
      <div className="card">
        <h3 className="font-semibold">Question reference (A1–A10)</h3>
        <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
          <ul className="space-y-1">
            <li><span className="text-foreground">A1</span> – Looks when you call their name</li>
            <li><span className="text-foreground">A2</span> – Easy to get eye contact</li>
            <li><span className="text-foreground">A3</span> – Points to indicate wants</li>
            <li><span className="text-foreground">A4</span> – Points to share interest</li>
            <li><span className="text-foreground">A5</span> – Pretend play</li>
          </ul>
          <ul className="space-y-1">
            <li><span className="text-foreground">A6</span> – Follows where you look</li>
            <li><span className="text-foreground">A7</span> – Comforts someone upset</li>
            <li><span className="text-foreground">A8</span> – First words were typical</li>
            <li><span className="text-foreground">A9</span> – Uses simple gestures</li>
            <li><span className="text-foreground">A10</span> – Stares at nothing</li>
          </ul>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          The original dataset encodes these as 0/1 features; our form maps your Yes/No selections consistently to those
          encodings.
        </p>
      </div>

      {/* Privacy & limitations */}
      <div className="card">
        <h3 className="font-semibold">Privacy & limitations</h3>
        <ul className="mt-2 list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="text-foreground font-medium">Local inference:</span> by default your answers stay on this
            device; the model runs in the browser.
          </li>
          <li>
            <span className="text-foreground font-medium">Dataset scope:</span> results reflect patterns in the training
            data and may not generalize to every population or context.
          </li>
          <li>
            Screening results can have false positives/negatives. Use them to support—not replace—clinical judgment.
          </li>
        </ul>
        <div className="mt-4 flex gap-3">
          <Link href="/screen">
            <Button variant="outline">Try different answers</Button>
          </Link>
          <Link href="/results">
            <Button>Back to results</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
