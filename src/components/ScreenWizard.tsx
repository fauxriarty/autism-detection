"use client";
import { useState } from "react";
import QuestionnaireForm from "./QuestionnaireForm";
import AudioRecorder from "./AudioRecorder";
import ImageCapture from "@/components/ImageCapture";
import ReviewPanel from "./ReviewPanel";
import { inferLocal, demoModel, topFactors } from "@/lib/inference";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ScreenWizard() {
  const [qFeat, setQFeat] = useState<Record<string, number>>({});
  const [aFeat, setAFeat] = useState<Record<string, number>>({});
  const [vFeat, setVFeat] = useState<Record<string, number>>({});
  const [step, setStep] = useState(1);
  const router = useRouter();

  function handleRun() {
    const features = { ...qFeat, ...aFeat, ...vFeat };
    const result = inferLocal(demoModel, features);
    const factors = topFactors(result.shap, 6);
    sessionStorage.setItem("result", JSON.stringify({ ...result, factors }));
    router.push("/results");
  }

  return (
    <div className="space-y-6">
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
            <ImageCapture onReady={(features, blob) => setVFeat(features)} />
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={()=>setStep(2)}>Back</Button>
              <Button onClick={()=>setStep(4)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <>
          <ReviewPanel onConfirm={handleRun} />
          <div className="flex justify-between">
            <Button variant="outline" onClick={()=>setStep(3)}>Back</Button>
            <Button onClick={handleRun}>Run screening</Button>
          </div>
        </>
      )}
    </div>
  );
}
