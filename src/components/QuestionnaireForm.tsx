"use client";
import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loadQChat } from "@/lib/qchat";

// Keys and Schema
const A_KEYS = [
  "A1","A2","A3","A4","A5","A6","A7","A8","A9","A10",
] as const;
type AKey = (typeof A_KEYS)[number];

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

const QTXT: Readonly<Record<AKey, string>> = {
  A1:"Does your child look at you when you call their name?",
  A2:"Does your child make eye contact easily?",
  A3:"Does your child point to indicate that they want something?",
  A4:"Does your child point to share interest with you?",
  A5:"Does your child pretend (e.g., care for dolls, talk on a toy phone)?",
  A6:"Does your child follow where you're looking?",
  A7:"If someone is upset, does your child try to comfort them?",
  A8:"Would you describe your child's first words as typical?",
  A9:"Does your child use simple gestures (e.g., wave goodbye)?",
  A10:"Does your child stare at nothing with no apparent purpose?",
};

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
export default function QuestionnaireForm({
  onReady,
}: {
  onReady: (features: Record<string, number | string>) => void;
}) {
  // Preload Q-CHAT model once when this component first mounts
  useEffect(() => {
    let mounted = true;
    loadQChat()
      .then(() => mounted && console.log("[Preload] Q-CHAT model ready"))
      .catch((e) => console.warn("[Preload] failed:", e));
    return () => {
      mounted = false;
    };
  }, []);

  // Default form values
  const defaults: Partial<FormData> = {
    Age_Mons: undefined,
    A1: undefined, A2: undefined, A3: undefined,
    A4: undefined, A5: undefined, A6: undefined,
    A7: undefined, A8: undefined, A9: undefined,
    A10: undefined,
    Sex: undefined,
    Family_mem_with_ASD: undefined,
  };

  const resolver = zodResolver(Schema) as Resolver<FormData>;
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver,
    defaultValues: defaults,
    mode: "onSubmit",
  });

  // Submit handler
  function onSubmit(data: FormData) {
    const feat: Record<string, number | string> = {
      Age_Mons: data.Age_Mons,
      Sex: data.Sex,
      Family_mem_with_ASD: Number(data.Family_mem_with_ASD),
    };
    for (const k of A_KEYS) feat[k] = Number(data[k]);
    onReady(feat);
  }

  // Render
  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Age */}
      <div className="rounded-xl border p-4">
        <div className="mb-4">
          <Label htmlFor="age" className="block mb-1">
            Age (months)
          </Label>
          <Input
            id="age"
            type="number"
            min={0}
            max={120}
            className={`max-w-[220px] ${errors.Age_Mons ? "border-red-500" : ""}`}
            {...register("Age_Mons", { valueAsNumber: true })}
          />
          {errors.Age_Mons && <p className="text-xs text-red-500 mt-1">{errors.Age_Mons.message}</p>}
        </div>
      </div>

      {/* Sex + Family */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-xl border p-4 ${errors.Sex ? "border-red-500" : ""}`}>
          <div className="mb-2 font-medium flex items-center gap-1">
            Sex
            {errors.Sex && <span className="text-red-500 text-sm">*</span>}
          </div>
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
        <div className={`rounded-xl border p-4 ${errors.Family_mem_with_ASD ? "border-red-500" : ""}`}>
          <div className="mb-2 font-medium flex items-center gap-1">
            Family member with ASD?
            {errors.Family_mem_with_ASD && <span className="text-red-500 text-sm">*</span>}
          </div>
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

      {/* Questions A1–A10 */}
      <div className="space-y-4">
        {A_KEYS.map((key, idx) => {
          const yesIsOne = key === "A10";
          const yesVal = yesIsOne ? "1" : "0";
          const noVal = yesIsOne ? "0" : "1";
          const hasError = !!(errors as Record<string, any>)[key];
          return (
            <div key={key} className={`rounded-xl border p-4 ${hasError ? "border-red-500" : ""}`}>
              <div className="mb-2 font-medium flex items-center gap-1">
                Q{idx + 1}. {QTXT[key]}
                {hasError && <span className="text-red-500 text-sm">*</span>}
              </div>
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