import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Autism Spectrum Disorder Private Screener",
  description: "Questionnaire + short audio + short video; processed locally on your device.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container py-10">{children}</main>
      </body>
    </html>
  );
}
