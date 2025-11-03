"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Consent", href: "/consent" },
  { label: "Start", href: "/screen" },
  { label: "Results", href: "/results" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 backdrop-blur-sm supports-[backdrop-filter]:bg-black/30">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="font-semibold text-lg sm:text-xl text-white hover:opacity-80 transition-opacity"
          aria-label="Home"
        >
          ASD Screener
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" role="navigation">
          {navItems.map(({ label, href }) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
              <Button
                variant="ghost"
                className={`h-9 px-4 transition-all duration-200 ease-in-out ${
                  pathname === href
                    ? "bg-white text-black hover:bg-black hover:text-white"
                    : "bg-transparent text-white hover:bg-white hover:text-black"
                }`}
              >
                {label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white hover:opacity-80 transition-opacity focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-black/90 border-t border-white/10 backdrop-blur-sm">
          <nav className="flex flex-col items-center py-3 space-y-2" role="navigation">
            {navItems.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                aria-current={pathname === href ? "page" : undefined}
                className="w-full max-w-sm"
              >
                <Button
                  variant="ghost"
                  className={`w-full text-center py-2 text-base ${
                    pathname === href
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
      )}
    </header>
  );
}
