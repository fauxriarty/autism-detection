"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>Autism Spectrum Disorder Screening</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Complete our research-based screening that combines behavioral assessment and visual analysis
            to provide insights about potential ASD traits. Results include an aggregate score and detailed 
            breakdown of contributing factors.
          </p>
          <div className="flex gap-3">
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
          <CardTitle className="text-lg">About This Screening Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Methodology Card */}
          <div className="space-y-2">
            <h3 className="font-medium">Methodology</h3>
            <p className="text-sm text-muted-foreground">
              Our advanced dual-model system provides a weighted composite score based on:
            </p>
            <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
              <li>Q-CHAT-10 behavioral assessment</li>
              <li>Visual analysis indicators</li>
              <li>Aggregate scoring (0-100 scale)</li>
            </ul>
          </div>

          {/* Privacy & Security Card */}
          <div className="space-y-2">
            <h3 className="font-medium">Privacy & Security</h3>
            <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
              <li>Secure local processing by default</li>
              <li>No raw data uploaded without explicit consent</li>
              <li>Complete data privacy control</li>
            </ul>
          </div>

          {/* Disclaimer */}
          <p className="text-sm text-muted-foreground border-t pt-4">
            This screening tool is for informational purposes only and not a medical diagnosis. 
            Always consult healthcare professionals for medical advice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}