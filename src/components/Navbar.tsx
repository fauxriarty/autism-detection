"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Menu, X, AlertCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";

const navItems = [
	{ label: "Home", href: "/" },
	{ label: "Start", href: null, isAction: true },
	{ label: "Results", href: "/results" },
] as const;

export default function Navbar() {
	const pathname = usePathname();
	const [menuOpen, setMenuOpen] = useState(false);
	const [showDisclaimer, setShowDisclaimer] = useState(false);
	const router = useRouter();

	const handleStartFromNavbar = () => {
		setShowDisclaimer(true);
		setMenuOpen(false);
	};

	const handleAcceptDisclaimer = () => {
		router.push("/screen");
		setShowDisclaimer(false);
	};

	return (
		<>
			<header className="sticky top-0 z-40 w-full border-b border-white/20 backdrop-blur-sm supports-[backdrop-filter]:bg-black/30">
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
					<nav className="hidden md:flex items-center gap-4" role="navigation">
						{navItems.map((item) => {
							if ("isAction" in item && item.isAction) {
								return (
									<Button
										key="start"
										onClick={handleStartFromNavbar}
										variant="ghost"
										className="h-9 px-4 transition-all duration-200 ease-in-out bg-transparent text-white hover:bg-white hover:text-black"
									>
										{item.label}
									</Button>
								);
							}
							return item.href ? (
								<Link
									key={item.href}
									href={item.href}
									aria-current={pathname === item.href ? "page" : undefined}
								>
									<Button
										variant="ghost"
										className={`h-9 px-4 transition-all duration-200 ease-in-out ${
											pathname === item.href
												? "bg-white text-black hover:bg-black hover:text-white"
												: "bg-transparent text-white hover:bg-white hover:text-black"
										}`}
									>
										{item.label}
									</Button>
								</Link>
							) : null;
						})}
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
							{navItems.map((item) => {
								if ("isAction" in item && item.isAction) {
									return (
										<Button
											key="start"
											onClick={handleStartFromNavbar}
											variant="ghost"
											className="w-full max-w-sm text-center py-2 text-base bg-transparent text-white hover:bg-white hover:text-black"
										>
											{item.label}
										</Button>
									);
								}
								return item.href ? (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setMenuOpen(false)}
										aria-current={pathname === item.href ? "page" : undefined}
										className="w-full max-w-sm"
									>
										<Button
											variant="ghost"
											className={`w-full text-center py-2 text-base ${
												pathname === item.href
													? "bg-white text-black hover:bg-black hover:text-white"
													: "bg-transparent text-white hover:bg-white hover:text-black"
											}`}
										>
											{item.label}
										</Button>
									</Link>
								) : null;
							})}
						</nav>
					</div>
				)}
			</header>

			{/* Disclaimer Modal */}
			{showDisclaimer && (
				<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
					<Card className="w-full sm:max-w-2xl border-amber-500/70 bg-amber-50/95 dark:bg-amber-950/30 max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col rounded-b-none sm:rounded-lg">
						{/* Header */}
						<div className="flex items-center justify-between bg-amber-50/95 dark:bg-amber-950/30 border-b border-amber-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10">
							<div className="flex items-center gap-2 min-w-0 flex-1">
								<AlertCircle className="h-5 w-6 sm:h-6 sm:w-6 text-amber-600 flex-shrink-0" />
								<CardTitle className="text-base sm:text-lg md:text-xl text-amber-600 truncate">
									Important Disclaimer
								</CardTitle>
							</div>
							<button
								onClick={() => setShowDisclaimer(false)}
								className="text-amber-600 hover:text-amber-700 transition-colors ml-2 flex-shrink-0"
								aria-label="Close disclaimer"
							>
								<X className="h-5 w-5 sm:h-6 sm:w-6" />
							</button>
						</div>

						{/* Content */}
						<CardContent className="space-y-3 sm:space-y-4 text-xs sm:text-sm md:text-base pt-4 sm:pt-6 pb-20 sm:pb-6 overflow-y-auto flex-1 px-4 sm:px-6">
							<div className="bg-amber-100/50 dark:bg-amber-900/20 p-3 sm:p-4 rounded-lg border border-amber-300/50">
								<p className="text-amber-900/95 dark:text-amber-100/90 font-semibold leading-snug">
									⚠️ This tool is designed for early detection screening in children only. 
									It is not a medical diagnosis and should not be used as a substitute for professional medical evaluation.
								</p>
							</div>

							<div className="space-y-2 sm:space-y-3 text-amber-900/90 dark:text-amber-100/80">
								<div>
									<p className="font-semibold text-amber-900 dark:text-amber-100 mb-1 sm:mb-2">What to provide:</p>
									<ul className="list-disc pl-5 sm:pl-6 space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
										<li><span className="font-semibold">Questionnaire:</span> Must be completed by the child&apos;s parent or guardian from their perspective</li>
										<li><span className="font-semibold">Photo:</span> A clear photo of the child&apos;s face is required for visual analysis</li>
									</ul>
								</div>

								<div>
									<p className="font-semibold text-amber-900 dark:text-amber-100 mb-1 sm:mb-2">Model training:</p>
									<ul className="list-disc pl-5 sm:pl-6 space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
										<li>Our visual analysis model has been trained on images of <span className="font-semibold">children</span></li>
										<li>The behavioral assessment is based on developmental patterns in <span className="font-semibold">children</span></li>
										<li>This tool may not be accurate for adults or individuals outside the intended age range</li>
									</ul>
								</div>

								<div>
									<p className="font-semibold text-amber-900 dark:text-amber-100 mb-1 sm:mb-2">Important limitations:</p>
									<ul className="list-disc pl-5 sm:pl-6 space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
										<li>Not suitable for adults or individuals outside the child age range</li>
										<li>Requires accurate parental reporting for behavioral assessment</li>
										<li>Visual analysis depends on photo quality and lighting conditions</li>
										<li>Results should be interpreted by healthcare professionals</li>
									</ul>
								</div>
							</div>

							<div className="bg-amber-100/50 dark:bg-amber-900/20 p-3 sm:p-4 rounded-lg border border-amber-300/50">
								<p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-100/85 leading-snug">
									If you have concerns about a child's development, please consult with a healthcare professional or developmental specialist for proper evaluation.
								</p>
							</div>
						</CardContent>

						{/* Footer */}
						<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 sm:p-6 border-t border-amber-200 bg-amber-100/80 dark:bg-amber-950/60 sticky bottom-0 z-10">
							<Button
								variant="outline"
								onClick={() => setShowDisclaimer(false)}
								className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5 h-auto"
							>
								Cancel
							</Button>
							<Button
								onClick={handleAcceptDisclaimer}
								className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm py-2 sm:py-2.5 h-auto"
							>
								I Understand, Continue
							</Button>
						</div>
					</Card>
				</div>
			)}
		</>
	);
}