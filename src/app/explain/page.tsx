import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ExplainPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>About this screener</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
            <li>Inputs: questionnaire, short audio (prosody), short video (gaze/pose cues).</li>
            <li>Local inference: a tiny model runs in your browser by default.</li>
            <li>Interpretation: we show which inputs most influenced the score (SHAP).</li>
            <li>This is not a diagnosis; please consult a clinician for evaluation.</li>
          </ul>
          
          <div className="mt-6 flex justify-end">
            <Link href="/results">
              <Button variant="outline">
                Back to results
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}