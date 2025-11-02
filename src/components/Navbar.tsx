"use client";

import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Consent", href: "/consent" },
  { label: "Start", href: "/screen" },
  { label: "Results", href: "/results" }
] as const;

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 backdrop-blur-sm supports-[backdrop-filter]:bg-black/30">
      <div className="container flex h-16 items-center justify-between">
        <Link 
          href="/" 
          className="font-semibold text-lg hover:opacity-80 transition-opacity text-white"
          aria-label="Home"
        >
          Autism Spectrum Disorder Private Screener
        </Link>

        <nav className="flex items-center gap-1" role="navigation">
          {navItems.map(({ label, href }) => (
            <Link 
              key={href} 
              href={href}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Button 
                variant="ghost" 
                className={`h-9 px-4 transition-all duration-200 ease-in-out
                  ${pathname === href 
                    ? "bg-white text-black hover:bg-black hover:text-white" 
                    : "bg-transparent text-white hover:bg-white hover:text-black"
                  }`}
              >
                {label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}