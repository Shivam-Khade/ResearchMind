"use client";

import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { ToastProvider, useToast } from "@/components/Toast";
import { OfflineBanner } from "@/components/OfflineBanner";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { CommandPalette } from "@/components/CommandPalette";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { AgentPipeline } from "@/components/workspace/AgentPipeline";
import { ReportViewer } from "@/components/workspace/ReportViewer";
import { RightRail, RightRailTab } from "@/components/workspace/RightRail";
import { ModelSelectorModal, ModelProvider } from "@/components/workspace/ModelSelectorModal";
import { useResearchRun } from "@/hooks/useResearchRun";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { loadSavedRuns, deleteRun, clearAllRuns } from "@/lib/storage";
import { ResearchRun, AgentId } from "@/lib/types";
import { Layers, BookOpen, Sliders } from "lucide-react";

function ResearchMindApp() {
  const {
    topic,
    status,
    agentStatuses,
    agentElapsed,
    logs,
    outputs,
    overallProgress,
    currentAgent,
    sources,
    report,
    critic,
    totalElapsed,
    start,
    cancel,
    retry,
    reset,
    loadRun,
  } = useResearchRun();

  const { toast } = useToast();

  // App UI state
  const [historyRuns, setHistoryRuns] = useState<ResearchRun[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ModelProvider>("gemini");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");
  const [rightRailTab, setRightRailTab] = useState<RightRailTab>("sources");
  const [mobileActiveZone, setMobileActiveZone] = useState<"pipeline" | "report" | "insights">("report");
  const [simulateErrorOnAgent, setSimulateErrorOnAgent] = useState<AgentId | null>(null);
  const [executionMode, setExecutionMode] = useState<"real" | "mock">("real");

  const handleToggleMode = () => {
    const nextMode = executionMode === "real" ? "mock" : "real";
    setExecutionMode(nextMode);
    toast({
      type: "info",
      title: nextMode === "real" ? "Live AI Swarm Active" : "Preview Mode Active",
      description:
        nextMode === "real"
          ? "Queries will execute live Tavily search and Google Gemini 2.5 Flash agents."
          : "Fast simulated execution with pre-configured research dossiers.",
    });
  };

  // Load history from storage on mount
  useEffect(() => {
    const loaded = loadSavedRuns();
    setHistoryRuns(loaded);
  }, []);

  // Sync history when runs finish
  useEffect(() => {
    if (status === "completed") {
      const refreshed = loadSavedRuns();
      setHistoryRuns(refreshed);

      // Trigger celebratory confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#ff8c32", "#ffbe6f", "#50c878", "#ffffff"],
      });

      toast({
        type: "success",
        title: "Synthesis Completed",
        description: "All 4 agents passed verification. Final report generated.",
      });
    }
  }, [status, toast]);

  // Handle Tab navigation shortcuts
  const handlePrevTab = useCallback(() => {
    setRightRailTab((prev) => {
      if (prev === "raw") return "critic";
      if (prev === "critic") return "sources";
      return "raw";
    });
  }, []);

  const handleNextTab = useCallback(() => {
    setRightRailTab((prev) => {
      if (prev === "sources") return "critic";
      if (prev === "critic") return "raw";
      return "sources";
    });
  }, []);

  // Keyboard shortcuts integration
  useKeyboardShortcuts({
    onCancel: () => {
      if (isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
        return;
      }
      if (isHistoryOpen) {
        setIsHistoryOpen(false);
        return;
      }
      if (status === "running") {
        cancel();
        toast({
          type: "info",
          title: "Run Cancelled",
          description: "Active agent execution stopped by user.",
        });
      }
    },
    onToggleCommandPalette: () => setIsCommandPaletteOpen((prev) => !prev),
    onPrevTab: handlePrevTab,
    onNextTab: handleNextTab,
    onCopyReport: () => {
      if (report) {
        navigator.clipboard.writeText(report);
        toast({
          type: "success",
          title: "Report Copied",
          description: "Markdown report copied to clipboard.",
        });
      }
    },
    onDownloadReport: () => {
      if (report) {
        const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `researchmind-report-${Date.now()}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({
          type: "success",
          title: "Download Initiated",
          description: "Saved markdown dossier to your device.",
        });
      }
    },
    onExportPDF: () => {
      if (report) window.print();
    },
  });

  // Start research handler
  const handleRunTopic = (topicQuery: string) => {
    start(topicQuery, simulateErrorOnAgent, executionMode, selectedProvider, selectedModel);
    setMobileActiveZone("report");
    toast({
      type: "info",
      title: executionMode === "real" ? "Live Multi-Agent Swarm Dispatched" : "Pipeline Dispatched",
      description: `Executing 4 sequential agents using ${selectedModel}…`,
    });
  };

  const handleSelectHistoryRun = (run: ResearchRun) => {
    loadRun(run);
    setIsHistoryOpen(false);
    toast({
      type: "info",
      title: "Dossier Loaded",
      description: `Loaded research on "${run.topic.slice(0, 30)}…"`,
    });
  };

  const handleDeleteHistoryRun = (runId: string) => {
    const updated = deleteRun(runId);
    setHistoryRuns(updated);
    toast({
      type: "info",
      title: "Run Removed",
      description: "Removed research dossier from history.",
    });
  };

  const handleClearAllHistory = () => {
    clearAllRuns();
    setHistoryRuns([]);
    toast({
      type: "info",
      title: "History Cleared",
      description: "All local runs have been deleted.",
    });
  };

  // Determine if we should show hero or workspace
  const showWorkspace = status !== "idle" || !!report || !!topic;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Offline banner */}
      <OfflineBanner onRetry={() => window.location.reload()} />

      {/* Main Navbar */}
      <Navbar
        status={status}
        topic={topic}
        overallProgress={overallProgress}
        totalElapsed={totalElapsed}
        historyCount={historyRuns.length}
        executionMode={executionMode}
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        onOpenModelSelector={() => setIsModelSelectorOpen(true)}
        onToggleMode={handleToggleMode}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onNewResearch={reset}
        onCancel={cancel}
        onRetry={() => {
          const firstFailed = (["search", "reader", "writer", "critic"] as const).find(
            (a) => agentStatuses[a] === "error"
          );
          if (firstFailed) retry(firstFailed);
          else if (topic) start(topic, simulateErrorOnAgent, executionMode, selectedProvider, selectedModel);
        }}
        simulateErrorOnAgent={simulateErrorOnAgent}
        onSetSimulateError={(agent) => {
          setSimulateErrorOnAgent(agent);
          toast({
            type: "info",
            title: agent ? `Error Simulation: ${agent}` : "Simulation Disabled",
            description: agent
              ? `The ${agent} agent will intentionally throw a simulated error.`
              : "Standard multi-agent execution restored.",
          });
        }}
      />

      {/* Main App Body */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {!showWorkspace ? (
          <div className="flex-1 overflow-y-auto">
            <HeroSection
              onRun={handleRunTopic}
              recentRuns={historyRuns}
              onSelectRun={handleSelectHistoryRun}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile Tab Switcher */}
            <div className="lg:hidden flex items-center justify-between p-1 bg-white/[0.02] border-b border-white/5 shrink-0">
              <button
                onClick={() => setMobileActiveZone("pipeline")}
                className={`flex-1 py-1.5 text-xs font-mono rounded-lg flex items-center justify-center gap-1.5 ${
                  mobileActiveZone === "pipeline"
                    ? "bg-amber-500/15 text-amber-300 font-semibold"
                    : "text-text-muted hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Agents</span>
              </button>
              <button
                onClick={() => setMobileActiveZone("report")}
                className={`flex-1 py-1.5 text-xs font-mono rounded-lg flex items-center justify-center gap-1.5 ${
                  mobileActiveZone === "report"
                    ? "bg-amber-500/15 text-amber-300 font-semibold"
                    : "text-text-muted hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
              <button
                onClick={() => setMobileActiveZone("insights")}
                className={`flex-1 py-1.5 text-xs font-mono rounded-lg flex items-center justify-center gap-1.5 ${
                  mobileActiveZone === "insights"
                    ? "bg-amber-500/15 text-amber-300 font-semibold"
                    : "text-text-muted hover:text-white"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Insights</span>
              </button>
            </div>

            {/* Desktop 3-Zone Layout */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Rail: Agent Pipeline */}
              <div
                className={`w-full lg:w-[280px] xl:w-[300px] shrink-0 border-r border-white/5 overflow-y-auto p-3.5 ${
                  mobileActiveZone !== "pipeline" ? "hidden lg:block" : "block"
                }`}
              >
                <AgentPipeline
                  agentStatuses={agentStatuses}
                  agentElapsed={agentElapsed}
                  logs={logs}
                  outputs={outputs}
                  currentAgent={currentAgent}
                  onRetry={retry}
                />
              </div>

              {/* Center Canvas: Report Card */}
              <div
                className={`flex-1 h-full min-h-0 p-3 sm:p-4 overflow-hidden flex justify-center ${
                  mobileActiveZone !== "report" ? "hidden lg:flex" : "flex"
                }`}
              >
                <ReportViewer
                  topic={topic}
                  report={report}
                  isWriterDone={agentStatuses.writer === "done"}
                  currentAgent={currentAgent}
                />
              </div>

              {/* Right Rail: Insights */}
              <div
                className={`w-full lg:w-[320px] xl:w-[340px] shrink-0 border-l border-white/5 overflow-y-auto p-3.5 ${
                  mobileActiveZone !== "insights" ? "hidden lg:block" : "block"
                }`}
              >
                <RightRail
                  activeTab={rightRailTab}
                  onSelectTab={setRightRailTab}
                  sources={sources}
                  scrapedUrl={outputs.reader}
                  critic={critic}
                  outputs={outputs}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        runs={historyRuns}
        onSelectRun={handleSelectHistoryRun}
        onDeleteRun={handleDeleteHistoryRun}
        onClearAll={handleClearAllHistory}
      />

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNewResearch={reset}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onCopyReport={() => {
          if (report) {
            navigator.clipboard.writeText(report);
            toast({
              type: "success",
              title: "Report Copied",
              description: "Markdown report copied to clipboard.",
            });
          }
        }}
        onDownloadReport={() => {
          if (report) {
            const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `researchmind-report-${Date.now()}.md`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }}
        onExportPDF={() => {
          if (report) window.print();
        }}
        onSwitchTab={(tab) => setRightRailTab(tab)}
        recentRuns={historyRuns}
        onSelectRun={handleSelectHistoryRun}
      />

      {/* Model & Provider Selector Modal */}
      <ModelSelectorModal
        isOpen={isModelSelectorOpen}
        onClose={() => setIsModelSelectorOpen(false)}
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        onSelect={(prov, mod) => {
          setSelectedProvider(prov);
          setSelectedModel(mod);
          toast({
            type: "success",
            title: "Model Engine Updated",
            description: `Active model switched to ${mod}`,
          });
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <ResearchMindApp />
    </ToastProvider>
  );
}
