import { NextRequest } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

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
  
  // Cross-platform Python resolver (Windows .venv/Scripts vs Linux/Docker .venv/bin vs system python3)
  const winVenv = path.join(workspaceRoot, ".venv", "Scripts", "python.exe");
  const linuxVenv = path.join(workspaceRoot, ".venv", "bin", "python");
  const pythonPath = process.env.PYTHON_PATH || (
    fs.existsSync(winVenv)
      ? winVenv
      : fs.existsSync(linuxVenv)
        ? linuxVenv
        : "python3"
  );

  const scriptPath = path.join(workspaceRoot, "run_stream.py");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
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
        const errMsg = errData.toString();
        console.error("Python stderr:", errMsg);
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
        isClosed = true;
        try {
          pyProcess.kill();
        } catch {
          // ignore
        }
        safeClose();
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
