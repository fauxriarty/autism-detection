"use client";
import { useState } from "react";
import QuestionnaireForm from "./QuestionnaireForm";
import AudioRecorder from "./AudioRecorder";
import ImageCapture from "@/components/ImageCapture";
import ReviewPanel from "./ReviewPanel";
import { inferQChat, buildDrivers } from "@/lib/qchat";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ScreenWizard() {
  const [qFeat, setQFeat] = useState<Record<string, any>>({});
  const [aFeat, setAFeat] = useState<Record<string, any>>({});
  const [vFeat, setVFeat] = useState<Record<string, any>>({});
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleRun() {
    try {
      setBusy(true);
      const all = { ...qFeat, ...aFeat, ...vFeat };
      console.log("[WIZARD] features going to ONNX:", all);

      const qres = await inferQChat(all);
      const { drivers, watchouts, qchatScore } = buildDrivers(all);

      sessionStorage.setItem("result", JSON.stringify({
        probability: qres.prob,
        band: qres.band,
        factors: drivers,              // used by TopFactors chips
        watchouts,                     // used in results paragraph (low-risk)
        qchatScore,
        answers: all,
      }));
      router.push("/results");
    } catch (e) {
      console.error(e);
      alert("Failed to run questionnaire model. Check console.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 relative">
      {busy && (
        <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="rounded-xl border px-6 py-4 bg-background">Running model…</div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {["Questionnaire","Audio","Image","Review"].map((label, i) => (
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
          <CardHeader><CardTitle>Audio</CardTitle></CardHeader>
          <CardContent>
            <AudioRecorder onReady={(f)=> setAFeat(f)} />
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={()=>setStep(1)}>Back</Button>
              <Button onClick={()=>setStep(3)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader><CardTitle>Image</CardTitle></CardHeader>
          <CardContent>
            <ImageCapture onReady={(f)=> setVFeat(f)} />
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={()=>setStep(2)}>Back</Button>
              <Button onClick={()=>setStep(4)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader><CardTitle>Review</CardTitle></CardHeader>
          <CardContent>
            <ReviewPanel onConfirm={handleRun} onBack={()=>setStep(3)} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
