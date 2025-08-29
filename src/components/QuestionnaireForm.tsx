"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Schema = z.object({
  age: z.coerce.number().min(1).max(99),
  q1: z.coerce.number().min(0).max(1),
  q2: z.coerce.number().min(0).max(1),
  q3: z.coerce.number().min(0).max(1),
  q4: z.coerce.number().min(0).max(1),
  q5: z.coerce.number().min(0).max(1),
});
type FormData = z.infer<typeof Schema>;

export default function QuestionnaireForm({ onReady }: { onReady: (features: Record<string, number>) => void }) {
  const { register, handleSubmit } = useForm<FormData>({ defaultValues: { age: 5, q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 } });
  function onSubmit(data: FormData) {
    const f = { age: data.age, q_sum: data.q1 + data.q2 + data.q3 + data.q4 + data.q5, q1: data.q1, q2: data.q2, q3: data.q3, q4: data.q4, q5: data.q5 };
    onReady(f);
  }
  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label className="block mb-1">Age (years)</Label>
        <Input type="number" {...register("age")} />
      </div>
      {[1,2,3,4,5].map((i) => (
        <div key={i} className="grid grid-cols-2 items-center gap-4 border rounded-xl p-3">
          <div>
            <div className="text-sm font-medium">Q{i}. Screening item</div>
            <div className="text-xs text-muted-foreground">0 = No, 1 = Yes</div>
          </div>
          <Input type="number" min={0} max={1} step={1} {...register(`q${i}` as keyof FormData)} />
        </div>
      ))}
      <Button type="submit">Save questionnaire</Button>
    </form>
  );
}
