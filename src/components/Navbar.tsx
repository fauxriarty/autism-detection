import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/20 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="container flex h-14 items-center justify-between">
        <span className="font-semibold">Autism Spectrum Disorder Private Screener</span>
        <nav className="flex gap-2">
          <a href="/"><Button variant="ghost" className="h-8 px-3">Home</Button></a>
          <a href="/consent"><Button variant="ghost" className="h-8 px-3">Consent</Button></a>
          <a href="/screen"><Button variant="ghost" className="h-8 px-3">Start</Button></a>
          <a href="/results"><Button variant="ghost" className="h-8 px-3">Results</Button></a>
        </nav>
      </div>
    </header>
  );
}
