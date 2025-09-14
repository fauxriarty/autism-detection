"use client";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// --- Typed keys --------------------------------------------------------------
const A_KEYS = [
  "A1","A2","A3","A4","A5","A6","A7","A8","A9","A10",
] as const;
type AKey = (typeof A_KEYS)[number];

// --- Schema ------------------------------------------------------------------
const Schema = z.object({
  Age_Mons: z.number().int().min(0).max(120),
  A1: z.enum(["0","1"]), A2: z.enum(["0","1"]), A3: z.enum(["0","1"]),
  A4: z.enum(["0","1"]), A5: z.enum(["0","1"]), A6: z.enum(["0","1"]),
  A7: z.enum(["0","1"]), A8: z.enum(["0","1"]), A9: z.enum(["0","1"]),
  A10: z.enum(["0","1"]),
  Sex: z.enum(["M","F"]),
  Family_mem_with_ASD: z.enum(["0","1"]),
});
type FormData = z.infer<typeof Schema>;

// --- Question text (Q2 is yes/no phrasing) ----------------------------------
const QTXT: Readonly<Record<AKey, string>> = {
  A1:"Does your child look at you when you call their name?",
  A2:"Does your child make eye contact easily?",
  A3:"Does your child point to indicate that they want something?",
  A4:"Does your child point to share interest with you?",
  A5:"Does your child pretend (e.g., care for dolls, talk on a toy phone)?",
  A6:"Does your child follow where you’re looking?",
  A7:"If someone is upset, does your child try to comfort them?",
  A8:"Would you describe your child’s first words as typical?",
  A9:"Does your child use simple gestures (e.g., wave goodbye)?",
  A10:"Does your child stare at nothing with no apparent purpose?",
} as const;

export default function QuestionnaireForm({
  onReady,
}: {
  onReady: (features: Record<string, number | string>) => void;
}) {
  // which preset button is “active” for styling
  const [preset, setPreset] = useState<"low"|"mid"|"high"|null>("high");

  const defaults: FormData = {
    Age_Mons: 36,
    // demo “higher-risk” defaults so users don’t always see 0%
    A1:"0",A2:"1",A3:"1",A4:"1",A5:"1",A6:"1",A7:"1",A8:"1",A9:"1",A10:"1",
    Sex:"M",
    Family_mem_with_ASD:"1",
  };

  const resolver = zodResolver(Schema) as unknown as Resolver<FormData, any, FormData>;
  const { register, handleSubmit, setValue } = useForm<FormData, any, FormData>({
    resolver,
    defaultValues: defaults,
  });

  function applyExample(which: "low"|"mid"|"high") {
    if (which === "low") {
      // largely typical answers
      setValue("Age_Mons", 24);
      for (let i = 0; i < 9; i++) setValue(A_KEYS[i], "0"); // A1..A9 typical (Yes→0)
      setValue("A10","0"); // A10 typical (No→0)
      setValue("Sex","F");
      setValue("Family_mem_with_ASD","0");
      setPreset("low");
      return;
    }

    if (which === "mid") {
      // borderline: 4 atypical points (common Q-CHAT threshold >3)
      // A1..A9: atypical = "1" (choose a few "No"); A10 atypical = "1" (Yes)
      setValue("Age_Mons", 30);
      setValue("Sex","M");
      setValue("Family_mem_with_ASD","0");

      // Start all typical
      for (let i = 0; i < 9; i++) setValue(A_KEYS[i], "0");
      setValue("A10","0");

      // Flip a few to atypical to total ~4 points
      setValue("A2","1");  // eye contact not easy
      setValue("A4","1");  // not pointing to share
      setValue("A6","1");  // not following gaze
      setValue("A10","1"); // stares at nothing (A10 atypical)
      setPreset("mid");
      return;
    }

    // "high"
    setValue("Age_Mons", 36);
    for (let i = 0; i < 9; i++) setValue(A_KEYS[i], "1");
    setValue("A10","1");
    setValue("Sex","M");
    setValue("Family_mem_with_ASD","1");
    setPreset("high");
  }

  function onSubmit(data: FormData) {
    const feat: Record<string, number | string> = {
      Age_Mons: data.Age_Mons,
      Sex: data.Sex,
      Family_mem_with_ASD: Number(data.Family_mem_with_ASD),
    };
    for (const k of A_KEYS) feat[k] = Number(data[k]);
    onReady(feat);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Age input with example buttons below it */}
      <div className="rounded-xl border p-4">
        <div className="mb-4">
          <Label htmlFor="age" className="block mb-1">Age (months)</Label>
          <Input
            id="age"
            type="number"
            min={0}
            max={120}
            className="max-w-[220px]"
            {...register("Age_Mons", { valueAsNumber: true })}
          />
          <p className="mt-1 text-xs text-muted-foreground">Q-CHAT uses months (e.g., 24, 36).</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            type="button"
            aria-pressed={preset==="low"}
            variant={preset==="low" ? "default" : "outline"}
            onClick={() => applyExample("low")}
            size="sm"
          >
            Example: low-risk
          </Button>
          <Button
            type="button"
            aria-pressed={preset==="mid"}
            variant={preset==="mid" ? "default" : "outline"}
            onClick={() => applyExample("mid")}
            size="sm"
          >
            Example: medium-risk
          </Button>
          <Button
            type="button"
            aria-pressed={preset==="high"}
            variant={preset==="high" ? "default" : "outline"}
            onClick={() => applyExample("high")}
            size="sm"
          >
            Example: high-risk
          </Button>
        </div>
      </div>

      {/* Sex + Family history */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <div className="mb-2 font-medium">Sex</div>
          <div className="flex gap-6">
            <label className="inline-flex items-center gap-2">
              <input type="radio" value="M" className="form-radio" {...register("Sex")} />
              <span>Male</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" value="F" className="form-radio" {...register("Sex")} />
              <span>Female</span>
            </label>
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="mb-2 font-medium">Family member with ASD?</div>
          <div className="flex gap-6">
            <label className="inline-flex items-center gap-2">
              <input type="radio" value="1" className="form-radio" {...register("Family_mem_with_ASD")} />
              <span>Yes</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" value="0" className="form-radio" {...register("Family_mem_with_ASD")} />
              <span>No</span>
            </label>
          </div>
        </div>
      </div>

      {/* A1..A10 */}
      <div className="space-y-4">
        {A_KEYS.map((key, idx) => {
          const yesIsOne = key === "A10"; // only A10: Yes=1, No=0
          const yesVal = yesIsOne ? "1" : "0";
          const noVal  = yesIsOne ? "0" : "1";
          return (
            <div key={key} className="rounded-xl border p-4">
              <div className="mb-2 font-medium">Q{idx + 1}. {QTXT[key]}</div>
              <div className="flex gap-6">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" className="form-radio" value={yesVal} {...register(key)} />
                  <span>Yes</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" className="form-radio" value={noVal} {...register(key)} />
                  <span>No</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end pt-2">
        <Button type="submit">Save and continue</Button>
      </div>
    </form>
  );
}
