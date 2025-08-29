import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReviewPanel({ onConfirm }: { onConfirm: () => void }) {
  return (
    <Card>
      <CardHeader><CardTitle>Review</CardTitle></CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">Review your inputs. You can go back to edit or re-record.</div>
        <Button className="mt-4" onClick={onConfirm}>Run screening</Button>
      </CardContent>
    </Card>
  );
}
