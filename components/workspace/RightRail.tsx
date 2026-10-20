"use client";

import React from "react";
import { SourceItem, CriticAnalysis } from "@/lib/types";
import { SourcesPanel } from "./SourcesPanel";
import { CriticPanel } from "./CriticPanel";
import { RawInspectorPanel } from "./RawInspectorPanel";
import { Globe, ShieldCheck, FileCode } from "lucide-react";

export type RightRailTab = "sources" | "critic" | "raw";

interface RightRailProps {
  activeTab: RightRailTab;
  onSelectTab: (tab: RightRailTab) => void;
  sources: SourceItem[];
  scrapedUrl?: string;
  critic: CriticAnalysis | null;
  outputs: {
    search: string;
    reader: string;
    writer: string;
    critic: string;
  };
}

export function RightRail({
  activeTab,
  onSelectTab,
  sources,
  scrapedUrl,
  critic,
  outputs,
}: RightRailProps) {
  const tabs: Array<{
    id: RightRailTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
  }> = [
    {
      id: "sources",
      label: "Sources",
      icon: Globe,
      badge: sources.length > 0 ? sources.length : undefined,
    },
    {
      id: "critic",
      label: "Critic",
      icon: ShieldCheck,
      badge: critic ? `${critic.score.toFixed(1)}` : undefined,
    },
    {
      id: "raw",
      label: "Raw",
      icon: FileCode,
    },
  ];

  return (
    <aside className="w-full flex flex-col gap-3 h-full select-none">
      {/* Segmented Tab Bar */}
      <div className="flex items-center p-1 rounded-xl bg-white/[0.02] border border-white/5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/25 shadow-sm"
                  : "text-text-muted hover:text-text-primary hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-amber-400 text-black font-bold"
                      : "bg-white/10 text-text-muted"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto pr-0.5">
        {activeTab === "sources" && (
          <SourcesPanel sources={sources} scrapedUrl={scrapedUrl} />
        )}
        {activeTab === "critic" && <CriticPanel critic={critic} />}
        {activeTab === "raw" && <RawInspectorPanel outputs={outputs} />}
      </div>
    </aside>
  );
}
