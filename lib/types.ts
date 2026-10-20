export type AgentId = "search" | "reader" | "writer" | "critic";

export type AgentStatus = "idle" | "running" | "done" | "error" | "blocked";

export type StreamEvent =
  | { type: "agent_start"; agent: AgentId; ts: number }
  | { type: "log"; agent: AgentId; message: string; ts: number; level?: "info" | "warn" | "success" | "error" }
  | { type: "agent_output"; agent: AgentId; content: string; ts: number }
  | { type: "agent_error"; agent: AgentId; error: string; ts: number }
  | { type: "complete"; ts: number };

export interface AgentLogItem {
  message: string;
  ts: number;
  level?: "info" | "warn" | "success" | "error";
}

export interface SourceItem {
  id: string;
  url: string;
  domain: string;
  title: string;
  snippet: string;
  publishedDate?: string;
  isScraped: boolean;
  relevanceScore?: number;
}

export interface CriticAnalysis {
  score: number; // e.g., 8.2 out of 10
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  rawText: string;
}

export interface ResearchRun {
  id: string;
  topic: string;
  createdAt: number;
  duration: number; // in seconds
  status: "running" | "completed" | "failed" | "cancelled";
  agentStatuses: Record<AgentId, AgentStatus>;
  agentElapsed: Record<AgentId, number>;
  logs: Record<AgentId, AgentLogItem[]>;
  outputs: Record<AgentId, string>;
  sources: SourceItem[];
  critic: CriticAnalysis | null;
  report: string;
  error?: string | null;
}

export interface AgentConfig {
  id: AgentId;
  name: string;
  displayName: string;
  role: string;
  description: string;
  iconName: string;
}
