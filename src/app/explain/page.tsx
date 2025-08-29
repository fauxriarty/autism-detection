import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function ExplainPage() {
  return (
    <Card>
      <CardHeader><CardTitle>About this screener</CardTitle></CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
          <li>Inputs: questionnaire, short audio (prosody), short video (gaze/pose cues).</li>
          <li>Local inference: a tiny model runs in your browser by default.</li>
          <li>Interpretation: we show which inputs most influenced the score (SHAP).</li>
          <li>This is not a diagnosis; please consult a clinician for evaluation.</li>
        </ul>
      </CardContent>
    </Card>
  );
}
