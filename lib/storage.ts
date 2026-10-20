import { ResearchRun, CriticAnalysis, SourceItem } from "./types";
import { generateMockRunForTopic } from "./mock-data";

const STORAGE_KEY = "researchmind_runs_v1";

export function loadSavedRuns(): ResearchRun[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial realistic run
      const initial = createSeedRun();
      saveRun(initial);
      return [initial];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to load runs from localStorage", e);
    return [];
  }
}

export function saveRun(run: ResearchRun): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadSavedRuns();
    const filtered = existing.filter((r) => r.id !== run.id);
    const updated = [run, ...filtered].slice(0, 30); // keep up to 30 runs
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save run to localStorage", e);
  }
}

export function deleteRun(runId: string): ResearchRun[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = loadSavedRuns();
    const updated = existing.filter((r) => r.id !== runId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to delete run", e);
    return [];
  }
}

export function clearAllRuns(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear history", e);
  }
}

function createSeedRun(): ResearchRun {
  const seedData = generateMockRunForTopic("Autonomous Multi-Agent AI Architectures");
  const now = Date.now() - 1000 * 60 * 42; // 42 minutes ago

  return {
    id: "run-seed-1",
    topic: "Autonomous Multi-Agent AI Architectures",
    createdAt: now,
    duration: 14.6,
    status: "completed",
    agentStatuses: {
      search: "done",
      reader: "done",
      writer: "done",
      critic: "done",
    },
    agentElapsed: {
      search: 2.4,
      reader: 3.8,
      writer: 5.2,
      critic: 3.2,
    },
    logs: {
      search: seedData.logs.search.map((m, i) => ({ message: m, ts: now + i * 300 })),
      reader: seedData.logs.reader.map((m, i) => ({ message: m, ts: now + 2400 + i * 400 })),
      writer: seedData.logs.writer.map((m, i) => ({ message: m, ts: now + 6200 + i * 500 })),
      critic: seedData.logs.critic.map((m, i) => ({ message: m, ts: now + 11400 + i * 350 })),
    },
    outputs: {
      search: JSON.stringify(seedData.sources, null, 2),
      reader: seedData.scrapedContent,
      writer: seedData.report,
      critic: seedData.critic.rawText,
    },
    sources: seedData.sources,
    critic: seedData.critic,
    report: seedData.report,
  };
}
