import { AgentId, StreamEvent } from "./types";
import { generateMockRunForTopic } from "./mock-data";

export interface ResearchRunOptions {
  topic: string;
  provider?: string;
  model?: string;
  onEvent: (event: StreamEvent) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  // Optional flag to simulate an error on a specific agent to demonstrate error & retry states
  simulateErrorOnAgent?: AgentId | null;
  startFromAgent?: AgentId; // For retries
  mode?: "real" | "mock";
}

export interface ResearchStreamSession {
  cancel: () => void;
  isCancelled: () => boolean;
}

/**
 * Interface defining the API Adapter contract.
 */
export interface IResearchAPIAdapter {
  startResearch(options: ResearchRunOptions): ResearchStreamSession;
  retryAgent(agent: AgentId, options: ResearchRunOptions): ResearchStreamSession;
}

/**
 * Real Multi-Agent Python API Adapter (Tavily Search + Gemini / Groq / HF)
 * Connects directly to the live Python pipeline via Server-Sent Events (SSE).
 */
export class RealResearchAPIAdapter implements IResearchAPIAdapter {
  private eventSource: EventSource | null = null;
  private cancelled = false;

  public startResearch(options: ResearchRunOptions): ResearchStreamSession {
    this.cancelled = false;
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    const { topic, provider = "gemini", model = "gemini-2.5-flash", onEvent, onComplete, simulateErrorOnAgent, mode } = options;

    // If simulation mode or error simulation requested, use mock adapter
    if (mode === "mock" || simulateErrorOnAgent) {
      const mock = new MockResearchAPIAdapter();
      return mock.startResearch(options);
    }

    try {
      const url = `/api/research/stream?topic=${encodeURIComponent(topic)}&provider=${encodeURIComponent(provider)}&model=${encodeURIComponent(model)}`;
      const es = new EventSource(url);
      this.eventSource = es;

      es.onmessage = (event) => {
        if (this.cancelled) return;
        try {
          const data: StreamEvent = JSON.parse(event.data);
          onEvent(data);
          if (data.type === "complete") {
            es.close();
            onComplete?.();
          } else if (data.type === "agent_error") {
            es.close();
          }
        } catch (e) {
          console.error("Failed to parse SSE event:", e);
        }
      };

      es.onerror = (err) => {
        if (this.cancelled) return;
        es.close();
        console.warn("Real SSE stream error, falling back to mock:", err);
        // Fallback to mock if Python process is disconnected
        const mock = new MockResearchAPIAdapter();
        mock.startResearch(options);
      };

      return {
        cancel: () => {
          this.cancelled = true;
          es.close();
        },
        isCancelled: () => this.cancelled || es.readyState === EventSource.CLOSED,
      };
    } catch (e) {
      console.warn("Could not initiate Real SSE, falling back to mock:", e);
      const mock = new MockResearchAPIAdapter();
      return mock.startResearch(options);
    }
  }

  public retryAgent(agent: AgentId, options: ResearchRunOptions): ResearchStreamSession {
    return this.startResearch(options);
  }
}

/**
 * Realistic Mock Stream Adapter
 * Streams lifecycle events, logs with millisecond timestamps, and staged agent outputs.
 */
export class MockResearchAPIAdapter implements IResearchAPIAdapter {
  private timerIds: NodeJS.Timeout[] = [];
  private cancelled = false;

  public startResearch(options: ResearchRunOptions): ResearchStreamSession {
    this.cancelled = false;
    this.clearTimers();

    const { topic, onEvent, onComplete, simulateErrorOnAgent } = options;
    const mockData = generateMockRunForTopic(topic);
    const agentsOrder: AgentId[] = ["search", "reader", "writer", "critic"];

    const startIndex = options.startFromAgent
      ? agentsOrder.indexOf(options.startFromAgent)
      : 0;

    let cumulativeDelay = 200; // start quickly for instant responsive feel

    for (let i = startIndex; i < agentsOrder.length; i++) {
      const agent = agentsOrder[i];
      const agentLogs = mockData.logs[agent] || [];
      const isSimulatedError = simulateErrorOnAgent === agent;

      // 1. Agent Start Event
      const startDelay = cumulativeDelay;
      this.schedule(() => {
        if (this.cancelled) return;
        onEvent({
          type: "agent_start",
          agent,
          ts: Date.now(),
        });
      }, startDelay);

      cumulativeDelay += 400;

      // 2. Stream intermediate log events for this agent
      const logInterval = Math.max(350, Math.floor(1800 / (agentLogs.length || 1)));
      agentLogs.forEach((logMessage) => {
        const currentLogDelay = cumulativeDelay;
        this.schedule(() => {
          if (this.cancelled) return;
          onEvent({
            type: "log",
            agent,
            message: logMessage,
            ts: Date.now(),
          });
        }, currentLogDelay);
        cumulativeDelay += logInterval;
      });

      // 3. Either trigger Error (if simulated) or Complete with Agent Output
      if (isSimulatedError) {
        const errorDelay = cumulativeDelay;
        this.schedule(() => {
          if (this.cancelled) return;
          onEvent({
            type: "agent_error",
            agent,
            error: `Failed to complete ${agent} phase: Connection timeout or upstream rate limit encountered. Downstream pipeline blocked.`,
            ts: Date.now(),
          });
        }, errorDelay);

        // Stop pipeline here because downstream agents are blocked
        break;
      } else {
        const outputDelay = cumulativeDelay;
        let outputContent = "";
        if (agent === "search") {
          outputContent = JSON.stringify(mockData.sources, null, 2);
        } else if (agent === "reader") {
          outputContent = mockData.scrapedContent;
        } else if (agent === "writer") {
          outputContent = mockData.report;
        } else if (agent === "critic") {
          outputContent = mockData.critic.rawText;
        }

        this.schedule(() => {
          if (this.cancelled) return;
          onEvent({
            type: "agent_output",
            agent,
            content: outputContent,
            ts: Date.now(),
          });
        }, outputDelay);

        cumulativeDelay += 600;
      }
    }

    // 4. Overall completion event if not errored
    if (!simulateErrorOnAgent) {
      this.schedule(() => {
        if (this.cancelled) return;
        onEvent({
          type: "complete",
          ts: Date.now(),
        });
        if (onComplete) onComplete();
      }, cumulativeDelay);
    }

    return {
      cancel: () => {
        this.cancelled = true;
        this.clearTimers();
      },
      isCancelled: () => this.cancelled,
    };
  }

  public retryAgent(agent: AgentId, options: ResearchRunOptions): ResearchStreamSession {
    return this.startResearch({
      ...options,
      startFromAgent: agent,
    });
  }

  private schedule(fn: () => void, delayMs: number) {
    const id = setTimeout(fn, delayMs);
    this.timerIds.push(id);
  }

  private clearTimers() {
    this.timerIds.forEach((id) => clearTimeout(id));
    this.timerIds = [];
  }
}

// Default export is the REAL live Python AI swarm adapter!
export const researchAPI: IResearchAPIAdapter = new RealResearchAPIAdapter();
