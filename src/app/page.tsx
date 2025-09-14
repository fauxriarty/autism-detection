import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl border p-8 md:p-10 bg-background/60">
        <h1 className="text-2xl md:text-3xl font-semibold">
          Private Autism Spectrum Disorder Screener
        </h1>
        <p className="mt-3 text-sm md:text-base text-muted-foreground">
          A short, privacy-first screener that runs mostly in your browser. You’ll answer a brief
          questionnaire and (optionally) add audio/video cues. The result is a{" "}
          <span className="font-medium">screening indicator</span>, not a diagnosis.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/screen">
            <Button size="lg">Start screening</Button>
          </Link>
          <Link href="/consent">
            <Button variant="outline" size="lg">Privacy & consent</Button>
          </Link>
          <Link href="/results">
            <Button variant="ghost" size="lg">View last result</Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <div className="font-medium">What you’ll do</div>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1">
              <li>• Complete a 10-question Q-CHAT style form</li>
              <li>• Optionally record a short audio prompt</li>
              <li>• Optionally capture a short video (gaze/pose cues)</li>
            </ul>
          </div>
          <div className="rounded-xl border p-4">
            <div className="font-medium">How results work</div>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1">
              <li>• A compact model runs locally by default</li>
              <li>• You’ll see a risk band and key contributing answers</li>
              <li>• Exportable summary for clinician discussion (coming soon)</li>
            </ul>
          </div>
          <div className="rounded-xl border p-4">
            <div className="font-medium">Privacy</div>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1">
              <li>• No raw media is uploaded unless you opt in</li>
              <li>• Computation happens in your browser when possible</li>
              <li>• You can clear data anytime</li>
            </ul>
          </div>
          <div className="rounded-xl border p-4">
            <div className="font-medium">Important</div>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1">
              <li>• This tool does not diagnose autism</li>
              <li>• Results should support—not replace—clinical judgment</li>
              <li>• If concerned, please consult a qualified professional</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
