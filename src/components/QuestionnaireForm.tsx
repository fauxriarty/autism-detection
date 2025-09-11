"use client";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const questions = [
  { key: "A1",  text: "Does your child look at you when you call his/her name?" },
  { key: "A2",  text: "How easy is it for you to get eye contact with your child?" },
  { key: "A3",  text: "Does your child point to indicate that s/he wants something (e.g., a toy out of reach)?" },
  { key: "A4",  text: "Does your child point to share interest with you (e.g., pointing at something interesting)?" },
  { key: "A5",  text: "Does your child pretend (e.g., care for dolls, talk on a toy phone)?" },
  { key: "A6",  text: "Does your child follow where you’re looking?" },
  { key: "A7",  text: "If someone is visibly upset, does your child show signs of wanting to comfort them (e.g., stroking, hugging)?" },
  { key: "A8",  text: "Would you describe your child’s first words as … ?" },
  { key: "A9",  text: "Does your child use simple gestures (e.g., wave goodbye)?" },
  { key: "A10", text: "Does your child stare at nothing with no apparent purpose?" },
] as const;

const Schema = z.object({
  Age_Mons: z.number().int().min(0).max(120),
  A1:  z.enum(["0","1"]),
  A2:  z.enum(["0","1"]),
  A3:  z.enum(["0","1"]),
  A4:  z.enum(["0","1"]),
  A5:  z.enum(["0","1"]),
  A6:  z.enum(["0","1"]),
  A7:  z.enum(["0","1"]),
  A8:  z.enum(["0","1"]),
  A9:  z.enum(["0","1"]),
  A10: z.enum(["0","1"]),
});
type FormData = z.infer<typeof Schema>;

export default function QuestionnaireForm({
  onReady,
}: {
  onReady: (features: Record<string, number>) => void;
}) {
  const defaults: FormData = {
    Age_Mons: 24,
    A1: "0", A2: "0", A3: "0", A4: "0", A5: "0",
    A6: "0", A7: "0", A8: "0", A9: "0", A10: "0",
  };

  // Cast the resolver to RHF's expected generic form (v7+ with 3 generics)
  const resolver = zodResolver(Schema) as unknown as Resolver<FormData, any, FormData>;

  const { register, handleSubmit, watch } = useForm<FormData, any, FormData>({
    resolver,
    defaultValues: defaults,
  });

  function onSubmit(data: FormData) {
    const feat: Record<string, number> = {
      Age_Mons: data.Age_Mons,
      A1: Number(data.A1), A2: Number(data.A2), A3: Number(data.A3), A4: Number(data.A4), A5: Number(data.A5),
      A6: Number(data.A6), A7: Number(data.A7), A8: Number(data.A8), A9: Number(data.A9), A10: Number(data.A10),
    };
    onReady(feat);
  }

  // Live Q-CHAT sum just for display (watch returns unknown -> coerce)
  const sum = questions.reduce((acc, q) => acc + Number(watch(q.key as keyof FormData) ?? 0), 0);

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label className="block mb-1">Age (months)</Label>
        <Input type="number" min={0} max={120} {...register("Age_Mons", { valueAsNumber: true })} />
        <p className="mt-1 text-xs text-muted-foreground">Dataset uses age in months (e.g., 24, 36).</p>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => {
          const name = q.key as keyof FormData;
          return (
            <div key={q.key} className="rounded-xl border p-4">
              <div className="mb-2 text-sm font-medium">
                Q{idx + 1}. {q.text}
              </div>
              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" value="1" {...register(name)} />
                  <span>Yes (1)</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" value="0" {...register(name)} />
                  <span>No (0)</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-muted-foreground">
          Current Q-CHAT score: <span className="font-semibold">{sum}</span> / 10
        </div>
        <Button type="submit">Save and continue</Button>
      </div>
    </form>
  );
}
