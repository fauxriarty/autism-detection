"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Main Card */}
      <Card className="text-center sm:text-left">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl md:text-2xl">
            Autism Spectrum Disorder Screening
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm sm:text-base text-muted-foreground">
            Complete our research-based screening that combines behavioral and visual analysis
            to provide insights about potential ASD traits. Results include an aggregate score
            and detailed breakdown of contributing factors.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
            <Button onClick={() => location.assign("/screen")}>Start screening</Button>
            <Button variant="outline" onClick={() => location.assign("/consent")}>
              Privacy &amp; consent
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">About This Screening Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm sm:text-base">
          <div className="space-y-2">
            <h3 className="font-medium">Methodology</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Q-CHAT-10 behavioral assessment</li>
              <li>Visual analysis indicators</li>
              <li>Aggregate scoring (0–100 scale)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Privacy &amp; Security</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Secure local processing by default</li>
              <li>No raw data uploaded without explicit consent</li>
              <li>Complete data privacy control</li>
            </ul>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground border-t pt-4">
            This tool is for informational purposes only and not a medical diagnosis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
