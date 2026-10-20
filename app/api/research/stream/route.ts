import { NextRequest } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { runNativeResearchStream } from "@/lib/server/native-agent-engine";
import { StreamEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");
  const provider = searchParams.get("provider") || "gemini";
  const model = searchParams.get("model") || "gemini-2.5-flash";

  if (!topic) {
    return new Response(JSON.stringify({ error: "Missing topic parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const workspaceRoot = process.cwd();
  const winVenv = path.join(workspaceRoot, ".venv", "Scripts", "python.exe");
  const linuxVenv = path.join(workspaceRoot, ".venv", "bin", "python");
  const hasLocalPython = !process.env.VERCEL && (fs.existsSync(winVenv) || fs.existsSync(linuxVenv));

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const safeEnqueue = (dataStr: string) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(dataStr));
        } catch {
          isClosed = true;
        }
      };

      const safeClose = () => {
        if (isClosed) return;
        isClosed = true;
        try {
          controller.close();
        } catch {
          // ignore
        }
      };

      let aborted = false;
      req.signal.addEventListener("abort", () => {
        aborted = true;
        isClosed = true;
        safeClose();
      });

      // If running on Vercel or no local Python venv exists, run native serverless engine
      if (process.env.VERCEL || !hasLocalPython) {
        try {
          await runNativeResearchStream({
            topic,
            provider,
            model,
            emitEvent: (event: StreamEvent) => {
              safeEnqueue(`data: ${JSON.stringify(event)}\n\n`);
            },
            isAborted: () => aborted || isClosed,
          });
        } catch (err: any) {
          const errEvent = JSON.stringify({
            type: "agent_error",
            agent: "writer",
            error: err.message,
            ts: Date.now(),
          });
          safeEnqueue(`data: ${errEvent}\n\n`);
        } finally {
          safeClose();
        }
        return;
      }

      // Otherwise, run local Python script in .venv
      const pythonPath = fs.existsSync(winVenv) ? winVenv : (fs.existsSync(linuxVenv) ? linuxVenv : "python3");
      const scriptPath = path.join(workspaceRoot, "run_stream.py");

      const pyProcess = spawn(pythonPath, [scriptPath, topic, provider, model], {
        cwd: workspaceRoot,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1",
        },
      });

      let buffer = "";

      pyProcess.stdout.on("data", (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && trimmed.startsWith("{") && trimmed.endsWith("}")) {
            safeEnqueue(`data: ${trimmed}\n\n`);
          }
        }
      });

      pyProcess.stderr.on("data", (errData: Buffer) => {
        console.error("Python stderr:", errData.toString());
      });

      pyProcess.on("close", (code) => {
        if (buffer.trim()) {
          const trimmed = buffer.trim();
          if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            safeEnqueue(`data: ${trimmed}\n\n`);
          }
        }
        if (code !== 0 && !isClosed) {
          const errEvent = JSON.stringify({
            type: "agent_error",
            agent: "writer",
            error: `Python process exited with code ${code}`,
            ts: Date.now(),
          });
          safeEnqueue(`data: ${errEvent}\n\n`);
        }
        safeClose();
      });

      pyProcess.on("error", (err) => {
        const errEvent = JSON.stringify({
          type: "agent_error",
          agent: "search",
          error: `Failed to spawn Python process: ${err.message}`,
          ts: Date.now(),
        });
        safeEnqueue(`data: ${errEvent}\n\n`);
        safeClose();
      });

      req.signal.addEventListener("abort", () => {
        try {
          pyProcess.kill();
        } catch {
          // ignore
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
