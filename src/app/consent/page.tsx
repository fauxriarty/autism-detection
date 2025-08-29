"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ConsentPage() {
  const [localOnly, setLocalOnly] = useState(true);
  useEffect(() => { const s = localStorage.getItem("consent.localOnly"); if (s !== null) setLocalOnly(s==="true"); }, []);
  useEffect(() => { localStorage.setItem("consent.localOnly", String(localOnly)); }, [localOnly]);

  return (
    <Card>
      <CardHeader><CardTitle>Consent & Privacy</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          We minimise data by design. By default, media and features are processed locally and never uploaded.
          You may delete everything at any time.
        </p>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm">Local-only processing (recommended)</span>
          <Button variant={localOnly ? "default" : "outline"} onClick={() => setLocalOnly(v=>!v)}>
            {localOnly ? "Enabled" : "Disabled"}
          </Button>
        </div>
        <div className="mt-6">
          <Button variant="outline" onClick={() => { localStorage.clear(); alert("All local data deleted."); }}>
            Delete all local data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
