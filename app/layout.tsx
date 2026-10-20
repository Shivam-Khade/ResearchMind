import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResearchMind — Multi-Agent AI Research System",
  description:
    "Autonomous multi-agent research engine orchestrating real-time web search, deep resource scraping, long-form markdown synthesis, and adversarial peer critique.",
  keywords: [
    "AI agents",
    "multi-agent system",
    "deep research",
    "autonomous synthesis",
    "search agent",
    "reader agent",
    "writer chain",
    "critic chain",
  ],
  authors: [{ name: "ResearchMind Engineering" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <div className="ambient-glow" aria-hidden="true" />
        <div className="grain-overlay" aria-hidden="true" />
        <div className="relative z-10 flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
