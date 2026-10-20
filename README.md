---
title: ResearchMind - Multi-Agent AI System
emoji: 🧠
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# ResearchMind — Multi-Agent AI Research System

A production-grade, flagship web UI for **ResearchMind** (Linear × Perplexity × Vercel aesthetic). An autonomous multi-agent intelligence platform orchestrating sequential web search, deep scraping, long-form synthesis, and adversarial peer critique.

---

## ⚡ Architecture & Sequential Agent Flow

The user inputs a research topic, and four agents execute sequentially, streaming typed lifecycle events and passing outputs forward:

```
[User Inquiry]
      │
      ▼
┌──────────────┐
│ Search Agent │  ➔ Discovers recent, verified web sources across scientific indices
└──────┬───────┘
       │ (Ranked candidate URLs)
       ▼
┌──────────────┐
│ Reader Agent │  ➔ Scrapes the top-signal URL for full raw article text
└──────┬───────┘
       │ (Scraped text content)
       ▼
┌──────────────┐
│ Writer Chain │  ➔ Synthesizes multi-section markdown dossier with benchmark tables & citations
└──────┬───────┘
       │ (Draft report)
       ▼
┌──────────────┐
│ Critic Chain │  ➔ Adversarial reflection: scores rigor (out of 10) & provides structured feedback
└──────┬───────┘
       │
       ▼
[Production Synthesis: Interactive Report, Scored Insights, Raw Inspector & Exportable .md]
```

---

## 🛠️ Stack & Technology

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + Glassmorphism tokens + CSS variables
- **Motion & Interactions:** Framer Motion (staggered cards, fluid status animations, connector flow)
- **Icons:** Lucide React
- **Markdown & Benchmarks:** `react-markdown` + `remark-gfm`
- **Celebration Effects:** `canvas-confetti`
- **State Management & Hook:** Custom `useResearchRun()` hook with event streaming, live elapsed timers, per-agent retry, error simulation, and `localStorage` persistence.

---

## 🎨 Visual Identity

- **Dark, Warm, Editorial:** Background `#0a0a0f` with an ambient amber radial glow top-left and subtle noise grain overlay.
- **Warm Paper Light Mode:** Clean editorial aesthetic (`#f7f5f0`) toggled instantly via the top navigation bar or `⌘K`.
- **Accent Palette:** Amber-orange (`#ff8c32` → `#ff5a1a`), success emerald (`#50c878`), and alert rose (`#f87171`).
- **Typography:** Syne (display/headings), DM Sans (body reading typography), and DM Mono (real-time logs, timestamps, metadata).
- **Reading Ergonomics:** Max ~72ch reading column with sticky action toolbar (Copy Markdown, Download `.md`, Export PDF with print stylesheet, and Full-screen mode).

---

## 📁 File Structure

```
Multi-Agents-System/
├── app/
│   ├── globals.css          # Design tokens, amber glow, print stylesheet, fonts
│   ├── layout.tsx           # Root layout, metadata, ambient grain overlay
│   └── page.tsx             # Main page: 3-zone layout, mobile tabs, state orchestration
├── components/
│   ├── Navbar.tsx           # Wordmark, status pill, theme toggle, simulate error menu
│   ├── HeroSection.tsx      # Command input, suggestion chips, 4-agent strip, recent runs
│   ├── CommandPalette.tsx   # Global ⌘K modal with search and quick actions
│   ├── HistoryDrawer.tsx    # Slide-over panel for past saved runs
│   ├── OfflineBanner.tsx    # Human-friendly network disconnect notification
│   ├── Toast.tsx            # Animated notification toast system
│   └── workspace/
│       ├── WorkspaceHeader.tsx   # Live topic, progress bar, elapsed timer, run controls
│       ├── AgentPipeline.tsx     # Left rail (~320px): vertical stepper with animated connectors
│       ├── AgentCard.tsx         # Agent card: role, status pill, timer, accordion, retry
│       ├── LogStream.tsx         # Monospace auto-scrolling log console with timestamps
│       ├── RawOutputModal.tsx    # Modal inspector for raw agent outputs
│       ├── ReportViewer.tsx      # Center canvas: long-form markdown, sticky toolbar, export
│       ├── TableOfContents.tsx   # Scroll-spy dynamic heading navigation
│       ├── WaitingState.tsx      # Animated skeleton with live agent activity narration
│       ├── RightRail.tsx         # Right rail (~340px): tabs for Sources, Critic, Raw
│       ├── SourcesPanel.tsx      # Rich source cards with "Scraped & Analyzed" badge
│       ├── CriticPanel.tsx       # SVG radial gauge (8.2/10), strengths, weaknesses, suggestions
│       └── RawInspectorPanel.tsx # Tabbed inspector for raw payloads with copy actions
├── hooks/
│   ├── useResearchRun.ts    # Main lifecycle hook: start, cancel, retry, agent state, logs
│   ├── useKeyboardShortcuts.ts # ⌘K, ⌘Enter, Esc, and tab switching [ and ]
│   └── useScrollSpy.ts      # Active section detection for Table of Contents
├── lib/
│   ├── api.ts               # Typed API adapter contract + mock streamer + real backend blueprint
│   ├── critic-parser.ts     # Heuristic extractor for score, strengths, weaknesses, verdict
│   ├── mock-data.ts         # Realistic multi-section reports, citations, tables, 7 sources
│   ├── storage.ts           # LocalStorage persistence for research runs
│   ├── types.ts             # Typed StreamEvent, AgentId, AgentStatus, ResearchRun
│   └── utils.ts             # Tailwind merge and formatting utilities
├── agents.py                # Python backend agent definitions (LangChain + Gemini)
├── pipeline.py              # Python multi-agent pipeline runner
└── tools.py                 # Web search and scraping tools
```

---

## 🔌 How to Plug in a Real Backend

The frontend communicates with an abstraction interface defined in `lib/api.ts`:

```typescript
export interface IResearchAPIAdapter {
  startResearch(options: ResearchRunOptions): ResearchStreamSession;
  retryAgent(agent: AgentId, options: ResearchRunOptions): ResearchStreamSession;
}
```

### Option A: Server-Sent Events (SSE) with FastAPI (Recommended)

1. Create a lightweight FastAPI wrapper around your existing `pipeline.py`:

```python
# server.py
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json, asyncio
from pipeline import run_research_pipeline

app = FastAPI()

@app.get("/api/research/stream")
async def stream_research(topic: str):
    async def event_generator():
        # 1. Search Agent
        yield f"data: {json.dumps({'type': 'agent_start', 'agent': 'search', 'ts': int(time.time()*1000)})}\n\n"
        # ... invoke search agent, emit logs and output ...
        
        # 2. Reader Agent
        yield f"data: {json.dumps({'type': 'agent_start', 'agent': 'reader', 'ts': int(time.time()*1000)})}\n\n"
        # ...
        
        # 3. Writer Chain
        # ...
        
        # 4. Critic Chain
        # ...
        yield f"data: {json.dumps({'type': 'complete', 'ts': int(time.time()*1000)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

2. In `lib/api.ts`, swap `researchAPI` to use `EventSource`:

```typescript
export class RealResearchAPIAdapter implements IResearchAPIAdapter {
  startResearch(options: ResearchRunOptions): ResearchStreamSession {
    const eventSource = new EventSource(`/api/research/stream?topic=${encodeURIComponent(options.topic)}`);

    eventSource.onmessage = (event) => {
      const data: StreamEvent = JSON.parse(event.data);
      options.onEvent(data);
    };

    eventSource.onerror = (err) => {
      options.onEvent({
        type: "agent_error",
        agent: "search",
        error: "Network stream interrupted",
        ts: Date.now(),
      });
      eventSource.close();
    };

    return {
      cancel: () => eventSource.close(),
      isCancelled: () => eventSource.readyState === EventSource.CLOSED,
    };
  }
}

// Set active adapter:
export const researchAPI: IResearchAPIAdapter = new RealResearchAPIAdapter();
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌘ + K` / `Ctrl + K` | Open global Command Palette |
| `⌘ + Enter` / `Ctrl + Enter` | Run research inquiry |
| `Esc` | Cancel running pipeline / Close modal |
| `[` | Switch to previous Insights tab (Sources ⟵ Critic ⟵ Raw) |
| `]` | Switch to next Insights tab (Sources ⟶ Critic ⟶ Raw) |

---

## 🧪 Testing Error Handling & Recovery

You can simulate agent failures at any time to verify the partial failure and retry UX:
1. In the top navbar, click **"Simulate Error: None"**.
2. Select any agent (e.g. **"Reader"** or **"Search"**).
3. Run research. The selected agent will fail, downstream agents will show the **"Blocked"** state, and a **"Retry"** button will appear on the failed agent.
4. Clicking **"Retry"** resumes the pipeline without losing state.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```
