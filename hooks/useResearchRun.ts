"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  AgentId,
  AgentStatus,
  StreamEvent,
  AgentLogItem,
  SourceItem,
  CriticAnalysis,
  ResearchRun,
} from "@/lib/types";
import { researchAPI, ResearchStreamSession } from "@/lib/api";
import { parseCriticFeedback } from "@/lib/critic-parser";
import { saveRun } from "@/lib/storage";

const AGENT_ORDER: AgentId[] = ["search", "reader", "writer", "critic"];

const INITIAL_STATUSES: Record<AgentId, AgentStatus> = {
  search: "idle",
  reader: "idle",
  writer: "idle",
  critic: "idle",
};

const INITIAL_ELAPSED: Record<AgentId, number> = {
  search: 0,
  reader: 0,
  writer: 0,
  critic: 0,
};

const INITIAL_LOGS: Record<AgentId, AgentLogItem[]> = {
  search: [],
  reader: [],
  writer: [],
  critic: [],
};

const INITIAL_OUTPUTS: Record<AgentId, string> = {
  search: "",
  reader: "",
  writer: "",
  critic: "",
};

export function useResearchRun() {
  const [topic, setTopic] = useState<string>("");
  const [runId, setRunId] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "running" | "completed" | "failed" | "cancelled">("idle");
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentId, AgentStatus>>(INITIAL_STATUSES);
  const [agentElapsed, setAgentElapsed] = useState<Record<AgentId, number>>(INITIAL_ELAPSED);
  const [logs, setLogs] = useState<Record<AgentId, AgentLogItem[]>>(INITIAL_LOGS);
  const [outputs, setOutputs] = useState<Record<AgentId, string>>(INITIAL_OUTPUTS);
  const [currentAgent, setCurrentAgent] = useState<AgentId | null>(null);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [scrapedContent, setScrapedContent] = useState<string>("");
  const [report, setReport] = useState<string>("");
  const [critic, setCritic] = useState<CriticAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalElapsed, setTotalElapsed] = useState<number>(0);

  const sessionRef = useRef<ResearchStreamSession | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeAgentRef = useRef<AgentId | null>(null);
  const startTimeRef = useRef<number>(0);
  const agentStartTimesRef = useRef<Record<AgentId, number>>({
    search: 0,
    reader: 0,
    writer: 0,
    critic: 0,
  });

  // Calculate overall progress percentage
  const calculateProgress = (): number => {
    if (status === "completed") return 100;
    if (status === "idle") return 0;
    let completedCount = 0;
    let runningWeight = 0;
    for (const a of AGENT_ORDER) {
      if (agentStatuses[a] === "done") completedCount++;
      else if (agentStatuses[a] === "running") runningWeight = 0.5;
    }
    const val = Math.min(95, Math.round(((completedCount + runningWeight) / 4) * 100));
    return val;
  };

  const overallProgress = calculateProgress();

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (sessionRef.current) sessionRef.current.cancel();
    };
  }, []);

  // Live timer tick
  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      if (startTimeRef.current > 0) {
        setTotalElapsed(Math.round(((Date.now() - startTimeRef.current) / 1000) * 10) / 10);
      }
      const active = activeAgentRef.current;
      if (active && agentStartTimesRef.current[active] > 0) {
        const elapsed = (Date.now() - agentStartTimesRef.current[active]) / 1000;
        setAgentElapsed((prev) => ({
          ...prev,
          [active]: Math.round(elapsed * 10) / 10,
        }));
      }
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Event handler for incoming stream events
  const handleStreamEvent = useCallback((event: StreamEvent) => {
    switch (event.type) {
      case "agent_start": {
        const agent = event.agent;
        activeAgentRef.current = agent;
        agentStartTimesRef.current[agent] = Date.now();
        setCurrentAgent(agent);
        setAgentStatuses((prev) => ({
          ...prev,
          [agent]: "running",
        }));
        setLogs((prev) => ({
          ...prev,
          [agent]: [
            ...(prev[agent] || []),
            { message: `Starting ${agent} phase…`, ts: event.ts, level: "info" },
          ],
        }));
        break;
      }

      case "log": {
        const agent = event.agent;
        setLogs((prev) => ({
          ...prev,
          [agent]: [
            ...(prev[agent] || []),
            { message: event.message, ts: event.ts, level: event.level || "info" },
          ],
        }));
        break;
      }

      case "agent_output": {
        const agent = event.agent;
        setAgentStatuses((prev) => ({
          ...prev,
          [agent]: "done",
        }));
        setOutputs((prev) => ({
          ...prev,
          [agent]: event.content,
        }));

        // Parse outputs into dedicated states
        if (agent === "search") {
          try {
            const parsed = JSON.parse(event.content);
            if (Array.isArray(parsed)) setSources(parsed);
          } catch {
            // keep raw
          }
        } else if (agent === "reader") {
          setScrapedContent(event.content);
        } else if (agent === "writer") {
          setReport(event.content);
        } else if (agent === "critic") {
          const parsed = parseCriticFeedback(event.content);
          setCritic(parsed);
        }
        break;
      }

      case "agent_error": {
        const agent = event.agent;
        activeAgentRef.current = null;
        stopTimer();
        setError(event.error);
        setStatus("failed");

        // Mark this agent as error and downstream agents as blocked
        const agentIndex = AGENT_ORDER.indexOf(agent);
        setAgentStatuses((prev) => {
          const next = { ...prev };
          next[agent] = "error";
          for (let i = agentIndex + 1; i < AGENT_ORDER.length; i++) {
            next[AGENT_ORDER[i]] = "blocked";
          }
          return next;
        });

        setLogs((prev) => ({
          ...prev,
          [agent]: [
            ...(prev[agent] || []),
            { message: `[ERROR] ${event.error}`, ts: event.ts, level: "error" },
          ],
        }));
        break;
      }

      case "complete": {
        activeAgentRef.current = null;
        setCurrentAgent(null);
        stopTimer();
        setStatus("completed");
        break;
      }
    }
  }, [stopTimer]);

  // Start research run
  const start = useCallback(
    (
      newTopic: string,
      simulateErrorOnAgent?: AgentId | null,
      mode: "real" | "mock" = "real",
      provider: string = "gemini",
      model: string = "gemini-2.5-flash"
    ) => {
      if (!newTopic.trim()) return;

      const id = `run-${Date.now()}`;
      setRunId(id);
      setTopic(newTopic.trim());
      setStatus("running");
      setError(null);
      setSources([]);
      setScrapedContent("");
      setReport("");
      setCritic(null);
      setTotalElapsed(0);
      setAgentStatuses(INITIAL_STATUSES);
      setAgentElapsed(INITIAL_ELAPSED);
      setLogs(INITIAL_LOGS);
      setOutputs(INITIAL_OUTPUTS);

      startTimeRef.current = Date.now();
      startTimer();

      sessionRef.current = researchAPI.startResearch({
        topic: newTopic.trim(),
        simulateErrorOnAgent: simulateErrorOnAgent || null,
        mode,
        provider,
        model,
        onEvent: handleStreamEvent,
      });
    },
    [handleStreamEvent, startTimer]
  );

  // Cancel research run
  const cancel = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.cancel();
    }
    stopTimer();
    activeAgentRef.current = null;
    setCurrentAgent(null);
    setStatus("cancelled");
    setAgentStatuses((prev) => {
      const next = { ...prev };
      for (const a of AGENT_ORDER) {
        if (next[a] === "running") next[a] = "idle";
      }
      return next;
    });
  }, [stopTimer]);

  // Retry an agent (and restart subsequent chain)
  const retry = useCallback(
    (agent: AgentId) => {
      if (!topic) return;

      const agentIndex = AGENT_ORDER.indexOf(agent);
      setError(null);
      setStatus("running");

      // Reset this agent and downstream to idle
      setAgentStatuses((prev) => {
        const next = { ...prev };
        for (let i = agentIndex; i < AGENT_ORDER.length; i++) {
          next[AGENT_ORDER[i]] = "idle";
        }
        return next;
      });

      startTimer();

      sessionRef.current = researchAPI.retryAgent(agent, {
        topic,
        startFromAgent: agent,
        onEvent: handleStreamEvent,
      });
    },
    [topic, handleStreamEvent, startTimer]
  );

  // Reset workspace to blank/home
  const reset = useCallback(() => {
    if (sessionRef.current) sessionRef.current.cancel();
    stopTimer();
    activeAgentRef.current = null;
    setCurrentAgent(null);
    setTopic("");
    setRunId("");
    setStatus("idle");
    setError(null);
    setAgentStatuses(INITIAL_STATUSES);
    setAgentElapsed(INITIAL_ELAPSED);
    setLogs(INITIAL_LOGS);
    setOutputs(INITIAL_OUTPUTS);
    setSources([]);
    setScrapedContent("");
    setReport("");
    setCritic(null);
    setTotalElapsed(0);
  }, [stopTimer]);

  // Load a saved run from history
  const loadRun = useCallback((saved: ResearchRun) => {
    if (sessionRef.current) sessionRef.current.cancel();
    stopTimer();
    activeAgentRef.current = null;
    setCurrentAgent(null);
    setRunId(saved.id);
    setTopic(saved.topic);
    setStatus(saved.status);
    setAgentStatuses(saved.agentStatuses);
    setAgentElapsed(saved.agentElapsed);
    setLogs(saved.logs);
    setOutputs(saved.outputs);
    setSources(saved.sources);
    setScrapedContent(saved.outputs.reader || "");
    setReport(saved.report || saved.outputs.writer || "");
    setCritic(saved.critic);
    setTotalElapsed(saved.duration);
    setError(saved.error || null);
  }, [stopTimer]);

  // Persist run on completion
  useEffect(() => {
    if (status === "completed" && report && runId && topic) {
      const completedRun: ResearchRun = {
        id: runId,
        topic,
        createdAt: Date.now(),
        duration: totalElapsed,
        status: "completed",
        agentStatuses,
        agentElapsed,
        logs,
        outputs,
        sources,
        critic,
        report,
      };
      saveRun(completedRun);
    }
  }, [status, report, runId, topic, totalElapsed, agentStatuses, agentElapsed, logs, outputs, sources, critic]);

  return {
    runId,
    topic,
    status,
    agentStatuses,
    agentElapsed,
    logs,
    outputs,
    overallProgress,
    currentAgent,
    sources,
    scrapedContent,
    report,
    critic,
    error,
    totalElapsed,
    isRunning: status === "running",
    isComplete: status === "completed",
    isCancelled: status === "cancelled",
    hasError: status === "failed",
    start,
    cancel,
    retry,
    reset,
    loadRun,
  };
}
