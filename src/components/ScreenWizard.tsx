"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import QuestionnaireForm from "./QuestionnaireForm";
import ImageCapture from "@/components/ImageCapture";
import ReviewPanel from "./ReviewPanel";
import { inferQChat, buildDrivers, type Band as QBand } from "@/lib/qchat";
import { inferVisionFromBlob, type VisionResult } from "@/lib/vision";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ScreenWizard() {
  const [qFeat, setQFeat] = useState<Record<string, unknown>>({});
  const [vFeat, setVFeat] = useState<Record<string, unknown>>({});
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const router = useRouter();



  async function handleRun() {
    try {
      setBusy(true);
      const all = { ...qFeat, ...vFeat };
      console.log("[WIZARD] features going to ONNX:", all);

      // 1️⃣ Q-CHAT (local)
      const qres = await inferQChat(all);
      console.log("[Q-CHAT] response:", qres);
      
      const { drivers, watchouts, qchatScore } = buildDrivers(all);

      // threshold logic (≥3 = red)
      const qBand: QBand = qchatScore >= 3 ? "red" : "green";
      const qProb = qchatScore / 10; // pseudo-probability 0–1

      // 2️⃣ Vision model (optional)
      let vres: VisionResult | undefined;
      if (imageBlob) {
        try {
          vres = await inferVisionFromBlob(imageBlob);
          console.log("[VISION] response:", vres);
        } catch (e) {
          console.warn("[VISION] failed, continuing with Q-CHAT only:", e);
        }
      }

      // 3️⃣ Store results
      sessionStorage.setItem(
        "result",
        JSON.stringify({
          qchat: { prob: qProb, band: qBand, score: qchatScore },
          vision: vres ?? null,
          drivers,
          watchouts,
           })
      );

      console.log("[RESULT STORED]", JSON.parse(sessionStorage.getItem("result") || "{}"));
      router.push("/results");
    } catch (e) {
      console.error(e);
      alert("Failed to run screening. Check console.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 relative">
            {busy && (
        <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-md flex items-center justify-center">
          <div className="rounded-xl border border-white/10 px-8 py-6 bg-background shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg font-medium">Processing</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Running behavioral and visual analysis...
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {["Questionnaire","Image","Review"].map((label, i) => (
          <span key={label} className={`badge ${step===i+1 ? "bg-muted" : ""}`}>{i+1}. {label}</span>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>Questionnaire</CardTitle></CardHeader>
          <CardContent><QuestionnaireForm onReady={(f)=>{ setQFeat(f); setStep(2); }} /></CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader><CardTitle>Image</CardTitle></CardHeader>
          <CardContent>
            <ImageCapture onReady={(f, blob) => { setVFeat(f); setImageBlob(blob ?? null); }} />
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={()=>setStep(1)}>Back</Button>
              <Button onClick={()=>setStep(3)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader><CardTitle>Review</CardTitle></CardHeader>
          <CardContent>
            <ReviewPanel onConfirm={handleRun} onBack={()=>setStep(2)} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
