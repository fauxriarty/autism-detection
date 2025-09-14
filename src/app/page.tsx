"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Private Autism Spectrum Disorder Screening</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Answer a short questionnaire adapted from Q-CHAT-10. A compact model suggests whether your answers are
            more or less consistent with ASD traits in a research dataset. Results appear as{" "}
            <span className="text-green-500 font-medium">GREEN</span> or{" "}
            <span className="text-red-500 font-medium">RED</span> and include the inputs that most influenced the suggestion.
            This is not a diagnosis.
          </p>

          <div className="flex gap-3">
            <Button onClick={() => location.assign("/screen")}>Start screening</Button>
            <Button variant="outline" onClick={() => location.assign("/consent")}>
              Privacy &amp; consent
            </Button>
          </div>

          <ul className="text-sm text-muted-foreground space-y-1 pt-1">
            <li>• Local processing by default</li>
            <li>• No raw media uploaded unless you opt in</li>
            <li>• Clinician-style PDF summary (coming soon)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
