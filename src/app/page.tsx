import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <Card>
      <CardHeader><CardTitle>Private Autism Spectrum Disorder Screening</CardTitle></CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          A simple 3-step screener: Questionnaire, a short Audio prompt, and a brief Video task.
          Processing is local by default. This is a screening aid, not a diagnosis.
        </p>
        <div className="mt-6 flex gap-3">
          <a href="/screen"><Button>Start screening</Button></a>
          <a href="/consent"><Button variant="outline">Privacy & consent</Button></a>
        </div>
        <ul className="mt-6 text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Local-only processing by default</li>
          <li>No raw media uploaded unless you opt in</li>
          <li>Download a clinician-ready summary (coming soon)</li>
        </ul>
      </CardContent>
    </Card>
  );
}
