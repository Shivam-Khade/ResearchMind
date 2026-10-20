"use client";

import React, { useState, useEffect } from "react";
import {
  AgentId,
  AgentStatus,
  AgentLogItem,
} from "@/lib/types";
import { AgentCard } from "./AgentCard";
import { LogStream } from "./LogStream";
import { RawOutputModal } from "./RawOutputModal";
import { Layers, Terminal, FileCode, CheckCircle2 } from "lucide-react";

interface AgentPipelineProps {
  agentStatuses: Record<AgentId, AgentStatus>;
  agentElapsed: Record<AgentId, number>;
  logs: Record<AgentId, AgentLogItem[]>;
  outputs: Record<AgentId, string>;
  currentAgent: AgentId | null;
  onRetry: (agent: AgentId) => void;
}

const AGENTS: Array<{
  id: AgentId;
  name: string;
  role: string;
}> = [
  {
    id: "search",
    name: "Search Agent",
    role: "Finds reliable web sources & rank URLs",
  },
  {
    id: "reader",
    name: "Reader Agent",
    role: "Picks top relevant URL & deep-scrapes",
  },
  {
    id: "writer",
    name: "Writer Chain",
    role: "Synthesizes multi-section markdown dossier",
  },
  {
    id: "critic",
    name: "Critic Chain",
    role: "Evaluates rigor & returns scored critique",
  },
];

export function AgentPipeline({
  agentStatuses,
  agentElapsed,
  logs,
  outputs,
  currentAgent,
  onRetry,
}: AgentPipelineProps) {
  // Active agent selected for viewing logs in console
  const [selectedAgent, setSelectedAgent] = useState<AgentId>("search");
  const [inspectModal, setInspectModal] = useState<{
    id: AgentId;
    name: string;
    content: string;
  } | null>(null);

  // Auto-follow current running agent for logs
  useEffect(() => {
    if (currentAgent) {
      setSelectedAgent(currentAgent);
    }
  }, [currentAgent]);

  const selectedAgentMeta = AGENTS.find((a) => a.id === selectedAgent) || AGENTS[0];
  const selectedLogs = logs[selectedAgent] || [];
  const selectedOutput = outputs[selectedAgent] || "";

  return (
    <aside className="w-full flex flex-col gap-3 h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-text-secondary font-semibold">
            Pipeline
          </h3>
        </div>
        <span className="text-[10px] font-mono text-text-muted">4 Sequential Stages</span>
      </div>

      {/* Compact, Stable Agent Cards */}
      <div className="space-y-1.5">
        {AGENTS.map((agent, index) => {
          const status = agentStatuses[agent.id];
          const isActive = currentAgent === agent.id;
          const isSelected = selectedAgent === agent.id;

          return (
            <AgentCard
              key={agent.id}
              id={agent.id}
              stepNumber={index + 1}
              name={agent.name}
              role={agent.role}
              status={status}
              elapsed={agentElapsed[agent.id] || 0}
              isActive={isActive}
              isSelected={isSelected}
              onSelect={() => setSelectedAgent(agent.id)}
              onRetry={() => onRetry(agent.id)}
              onViewRaw={() =>
                setInspectModal({
                  id: agent.id,
                  name: agent.name,
                  content: outputs[agent.id] || "",
                })
              }
            />
          );
        })}
      </div>

      {/* Dedicated Stable Log & Payload Console */}
      <div className="flex-1 flex flex-col min-h-[220px] rounded-xl border border-white/5 bg-[#08080c] overflow-hidden mt-1 shadow-sm">
        {/* Console Header / Agent Tabs */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-white/[0.02] border-b border-white/5">
          <div className="flex items-center gap-1">
            {AGENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAgent(a.id)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize transition-all ${
                  selectedAgent === a.id
                    ? "bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30"
                    : "text-text-muted hover:text-text-primary hover:bg-white/5"
                }`}
              >
                {a.id}
              </button>
            ))}
          </div>

          {selectedOutput && (
            <button
              onClick={() =>
                setInspectModal({
                  id: selectedAgent,
                  name: selectedAgentMeta.name,
                  content: selectedOutput,
                })
              }
              className="text-[10px] font-mono text-text-muted hover:text-amber-400 flex items-center gap-1 transition-colors"
              title="Inspect Raw Agent Output"
            >
              <FileCode className="w-3 h-3" />
              <span>Raw</span>
            </button>
          )}
        </div>

        {/* Scrollable Monospace Logs */}
        <div className="flex-1 overflow-hidden p-1">
          <LogStream
            logs={selectedLogs}
            isRunning={currentAgent === selectedAgent}
          />
        </div>
      </div>

      {/* Raw Output Modal */}
      {inspectModal && (
        <RawOutputModal
          isOpen={true}
          onClose={() => setInspectModal(null)}
          agentId={inspectModal.id}
          agentName={inspectModal.name}
          content={inspectModal.content}
        />
      )}
    </aside>
  );
}
