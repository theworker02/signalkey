import { spawn, type ChildProcess } from "node:child_process";
import { EventEmitter } from "node:events";
import path from "node:path";
import { stat } from "node:fs/promises";
import type { Profile } from "./profiles";
import type { State } from "../../../packages/protocol";
export class Runner extends EventEmitter {
  state: State = "idle";
  output = "";
  child: ChildProcess | null = null;
  busy = false;
  exitCode: number | null = null;
  durationMs = 0;
  launchMs: number | null = null;
  startedAt: string | null = null;
  truncated = false;
  private outputBuffer = Buffer.alloc(0);
  private stopReason: string | null = null;
  private stateTo(state: State) {
    this.state = state;
    this.emit("change");
  }
  private log(s: string) {
    const combined = Buffer.concat([this.outputBuffer, Buffer.from(s)]);
    this.truncated ||= combined.length > 32768;
    let offset = Math.max(0, combined.length - 32768);
    while (offset < combined.length && (combined[offset] & 0xc0) === 0x80)
      offset++;
    this.outputBuffer = combined.subarray(offset);
    this.output = this.outputBuffer.toString("utf8");
    this.emit("change");
  }
  async run(p: Profile): Promise<void> {
    if (this.busy) throw new Error("BUSY: cancel or wait for the active run");
    if (!p.enabled)
      throw new Error("DISABLED: review and enable this profile first");
    this.busy = true;
    this.stopReason = null;
    this.outputBuffer = Buffer.alloc(0);
    this.output = "";
    this.truncated = false;
    this.exitCode = null;
    this.durationMs = 0;
    this.launchMs = null;
    this.startedAt = new Date().toISOString();
    const start = performance.now();
    this.stateTo("running");
    try {
      if (!path.isAbsolute(p.cwd))
        throw new Error("Working directory must be absolute");
      if (!(await stat(p.cwd)).isDirectory())
        throw new Error("Working directory is not a directory");
    } catch (e) {
      this.busy = false;
      this.log(`Preflight failed: ${String(e)}\n`);
      this.durationMs = performance.now() - start;
      this.stateTo("failure");
      throw e;
    }
    if (this.stopReason) {
      this.busy = false;
      this.stateTo("cancelled");
      return;
    }
    this.output = "";
    this.stateTo("running");
    this.log(
      `> ${JSON.stringify([p.executable, ...p.args])}\nWorking directory: ${p.cwd}\n`,
    );
    await new Promise<void>((resolve) => {
      let settled = false;
      let timer: NodeJS.Timeout | undefined;
      const finish = (code: number | null, error?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        this.child = null;
        this.busy = false;
        this.exitCode = code;
        this.durationMs = performance.now() - start;
        this.log(
          error
            ? `\nLaunch failed: ${error.message}\n`
            : `\n${this.stopReason ?? `Exited ${code}`}\n`,
        );
        this.stateTo(
          this.stopReason === "Cancelled"
            ? "cancelled"
            : code === 0 && !this.stopReason && !error
              ? "success"
              : "failure",
        );
        resolve();
      };
      let child: ChildProcess;
      try {
        child = spawn(p.executable, p.args, {
          cwd: p.cwd,
          shell: false,
          windowsHide: true,
          detached: process.platform !== "win32",
          env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (e) {
        finish(null, e instanceof Error ? e : new Error(String(e)));
        return;
      }
      this.child = child;
      child.once("spawn", () => {
        this.launchMs = performance.now() - start;
        this.emit("change");
      });
      timer = setTimeout(() => void this.stop("Timed out"), p.timeoutMs);
      child.stdout?.setEncoding("utf8").on("data", (b: string) => this.log(b));
      child.stderr?.setEncoding("utf8").on("data", (b: string) => this.log(b));
      child.once("error", (e) => finish(null, e));
      child.once("close", (code) => finish(code));
    });
  }
  async stop(reason = "Cancelled") {
    if (!this.busy) return;
    this.stopReason = reason;
    if (!this.child?.pid) return;
    const pid = this.child.pid;
    if (process.platform === "win32") {
      await new Promise<void>((resolve, reject) => {
        const killer = spawn(
          path.join(
            process.env.SystemRoot ?? "C:\\Windows",
            "System32",
            "taskkill.exe",
          ),
          ["/PID", String(pid), "/T", "/F"],
          { windowsHide: true },
        );
        killer.once("error", reject);
        killer.once("close", (c) =>
          c === 0
            ? resolve()
            : reject(new Error(`Process-tree cleanup failed (${c})`)),
        );
      }).catch((e) => {
        this.log(`\n${String(e)}\n`);
        this.emit("cleanup-error", String(e));
      });
    } else {
      try {
        process.kill(-pid, "SIGKILL");
      } catch (e) {
        this.log(String(e));
      }
    }
  }
}
