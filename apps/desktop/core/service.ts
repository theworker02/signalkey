import { EventEmitter } from "node:events";
import { readFile, writeFile, rename, mkdir, stat, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { z } from "zod";
import { Runner } from "./runner";
import {
  profileSchema,
  migrateProfile,
  defaultBindings,
  type Profile,
} from "./profiles";
import { runRecordSchema, type RunRecord } from "./history";
import {
  VirtualDevice,
  HidDevice,
  type Transport,
  type Gesture,
} from "./transport";
import { Op, states, type State } from "../../../packages/protocol";
type Source = "button" | "desktop" | "sdk";
export class Service extends EventEmitter {
  runner = new Runner();
  profiles: Profile[] = [];
  selected = "sample-pass";
  device: Transport = new VirtualDevice();
  target = "virtual:signalkey";
  errors: string[] = [];
  history: RunRecord[] = [];
  activeProfile: string | null = null;
  lastGesture: Gesture | null = null;
  simulationPaused = false;
  private runReserved = false;
  private cancelRequested = false;
  private recoveryBlocked = false;
  get busy() {
    return this.runReserved || this.runner.busy;
  }
  private external: { state: State; until: number } | null = null;
  private timer?: NodeJS.Timeout;
  private writing = Promise.resolve();
  private syncing = false;
  private stopping = false;
  private runningTask: Promise<void> | null = null;
  private lastHeartbeat = -Infinity;
  private lastLight = "";
  private reconnectAt = 0;
  private configMutation = Promise.resolve();
  constructor(
    readonly directory: string,
    readonly root: string,
    readonly executable: string,
  ) {
    super();
    this.runner.on("change", () => {
      this.emit("change");
      void this.tick();
    });
    this.bindDevice();
  }
  private bindDevice() {
    this.device.on("press", (gesture: Gesture) => {
      this.lastGesture = gesture;
      this.emit("press", gesture);
      void this.gesture(gesture).catch((e) => this.error(e));
    });
    this.device.on("disconnect", () => {
      this.lastLight = "";
      this.emit("change");
    });
    this.device.on("protocol-error", (e: unknown) => this.error(e));
  }
  private async gesture(gesture: Gesture) {
    const profile = this.profiles.find((p) => p.id === this.selected);
    if (!profile) throw new Error("PROFILE_NOT_FOUND");
    const binding = profile.bindings[gesture];
    if (binding.kind === "none") return;
    if (binding.kind === "cancel") {
      await this.cancel();
      return;
    }
    if (!profile.enabled)
      throw new Error("DISABLED: review and enable this workflow first");
    await this.run(binding.profileId ?? profile.id, "button");
  }
  error(e: unknown) {
    const message = String(e);
    if (this.errors.at(-1) !== message)
      this.errors = [...this.errors.slice(-19), message];
    this.emit("change");
  }
  private async readJson(name: string, limit: number) {
    const file = path.join(this.directory, name);
    if ((await stat(file)).size > limit)
      throw new Error(name + " exceeds its size limit");
    return JSON.parse(await readFile(file, "utf8")) as unknown;
  }
  async init() {
    await mkdir(this.directory, { recursive: true });
    try {
      const saved = z
        .object({
          profiles: z.array(z.unknown()).min(1).max(100),
          selected: z.string(),
          target: z.string(),
        })
        .parse(await this.readJson("profiles.json", 1048576));
      this.profiles = saved.profiles.map(migrateProfile);
      if (new Set(this.profiles.map((p) => p.id)).size !== this.profiles.length)
        throw new Error("Duplicate profile identities");
      this.selected = this.profiles.some((p) => p.id === saved.selected)
        ? saved.selected
        : this.profiles[0].id;
      this.target = saved.target;
      if (this.target !== this.device.id) this.device.close();
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") {
        this.error(
          "Configuration recovery: " +
            String(e) +
            ". Original preserved in a recovery copy.",
        );
        try {
          const original = await readFile(
            path.join(this.directory, "profiles.json"),
          );
          await writeFile(
            path.join(
              this.directory,
              "profiles.recovery-" + Date.now() + ".json",
            ),
            original,
            { mode: 0o600 },
          );
        } catch (copyError) {
          throw new Error(
            "Cannot preserve configuration: " + String(copyError),
          );
        }
      }
      this.profiles = ["pass", "fail"].map((mode) => ({
        version: 2,
        id: "sample-" + mode,
        name:
          "Sample · " + (mode === "pass" ? "passing" : "failing") + " tests",
        executable: this.executable,
        args: [
          path.join(this.root, "examples/sample/project.mjs"),
          ...(mode === "fail" ? ["--fail"] : []),
        ],
        cwd: this.root,
        timeoutMs: 30000,
        enabled: true,
        brightness: 32,
        bindings: {
          ...defaultBindings(),
          double: { kind: "run", profileId: "sample-fail" },
        },
      }));
    }
    try {
      this.history = z
        .array(runRecordSchema)
        .max(100)
        .parse(await this.readJson("history.json", 262144));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT")
        this.error("Run history unavailable: " + String(e));
    }
    try {
      const pending = runRecordSchema
        .pick({
          id: true,
          profileId: true,
          profileName: true,
          source: true,
          startedAt: true,
        })
        .parse(await this.readJson("active-run.json", 65536));
      if (!this.history.some((r) => r.id === pending.id)) {
        this.history = [
          {
            ...pending,
            finishedAt: new Date().toISOString(),
            durationMs: Math.max(0, Date.now() - Date.parse(pending.startedAt)),
            state: "interrupted" as const,
            exitCode: null,
            summary:
              "Companion ended before a durable result. Outcome unknown; inspect external effects before any manual retry.",
          },
          ...this.history,
        ].slice(0, 100);
        await this.atomic("history.json", this.history);
        this.error(
          "Interrupted action recovered: outcome unknown. No action retried. Verify external effects before running again.",
        );
      }
      await rm(path.join(this.directory, "active-run.json"));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") {
        this.recoveryBlocked = true;
        this.error(
          "RECOVERY_REQUIRED: active-run record could not be reconciled; execution blocked. " +
            String(e),
        );
      }
    }
    this.timer = setInterval(() => void this.tick(), 250);
    await this.tick();
  }
  get state(): State {
    if (!this.device.connected) return "disconnected";
    if (this.simulationPaused) return this.device.state;
    if (this.busy) return "running";
    if (this.external)
      return performance.now() < this.external.until
        ? this.external.state
        : "unknown";
    return this.runner.state;
  }
  snapshot() {
    return {
      state: this.state,
      deviceState: this.device.state,
      connected: this.device.connected,
      target: this.target,
      profiles: this.profiles,
      selected: this.selected,
      output: this.runner.output,
      busy: this.busy,
      errors: this.errors,
      history: this.history,
      activeProfile: this.activeProfile,
      lastGesture: this.lastGesture,
      simulationPaused: this.simulationPaused,
      startedAt: this.runner.startedAt,
      durationMs: this.runner.durationMs,
      launchMs: this.runner.launchMs,
      truncated: this.runner.truncated,
      exitCode: this.runner.exitCode,
      capabilities: this.device.capabilities,
    };
  }
  async devices() {
    try {
      return [
        { id: "virtual:signalkey", name: "Virtual SignalKey (simulator)" },
        ...(await HidDevice.discover()),
      ];
    } catch (e) {
      this.error("HID unavailable: " + String(e));
      return [
        { id: "virtual:signalkey", name: "Virtual SignalKey (simulator)" },
      ];
    }
  }
  async connect(id: string) {
    if (this.busy) throw new Error("Wait for the run before changing device");
    const next =
      id === "virtual:signalkey"
        ? new VirtualDevice()
        : await HidDevice.open(id);
    try {
      await this.writeConfiguration(this.profiles, this.selected, id);
    } catch (e) {
      next.close();
      throw e;
    }
    this.device.close();
    this.device = next;
    this.target = id;
    this.external = null;
    this.simulationPaused = false;
    this.runner.state = "unknown";
    this.lastLight = "";
    this.lastHeartbeat = -Infinity;
    this.bindDevice();
    await this.tick();
    this.emit("change");
  }
  async tick() {
    if (this.syncing || this.stopping) return;
    this.syncing = true;
    try {
      const now = performance.now();
      if (this.device instanceof VirtualDevice) this.device.tick(now);
      if (
        !this.device.connected &&
        this.target.startsWith("hid:") &&
        now >= this.reconnectAt
      ) {
        this.reconnectAt = now + 2000;
        try {
          this.device = await HidDevice.open(this.target);
          this.bindDevice();
          this.runner.state = "unknown";
          this.external = null;
          this.lastLight = "";
          this.lastHeartbeat = -Infinity;
        } catch {
          return;
        }
      }
      if (this.device.connected && !this.simulationPaused) {
        if (now - this.lastHeartbeat >= 2000) {
          await this.device.send(Op.HEARTBEAT);
          this.lastHeartbeat = now;
        }
        const state = this.state;
        const brightness =
          this.profiles.find((p) => p.id === this.selected)?.brightness ?? 32;
        const light = state + ":" + brightness;
        if (light !== this.lastLight) {
          await this.device.send(
            Op.SET_LIGHT,
            new Uint8Array([states.indexOf(state)]),
          );
          await this.device.send(
            Op.SET_BRIGHTNESS,
            new Uint8Array([brightness]),
          );
          await this.device.readState();
          this.lastLight = light;
        }
      }
      this.emit("change");
    } catch (e) {
      this.error(e);
      this.device.close();
    } finally {
      this.syncing = false;
    }
  }
  async cancel() {
    this.cancelRequested = true;
    await this.runner.stop();
  }
  async run(id: string, source: Source = "desktop") {
    if (this.stopping) throw new Error("Companion is shutting down");
    if (this.recoveryBlocked)
      throw new Error(
        "RECOVERY_REQUIRED: resolve active-run record before execution",
      );
    const profile = this.profiles.find((p) => p.id === id);
    if (!profile) throw new Error("PROFILE_NOT_FOUND");
    if (this.busy) throw new Error("BUSY: cancel or wait for the active run");
    if (!profile.enabled)
      throw new Error("DISABLED: review and enable this workflow first");
    this.runReserved = true;
    this.cancelRequested = false;
    const p = structuredClone(profile);
    const pending = {
      id: randomUUID(),
      profileId: p.id,
      profileName: p.name,
      source,
      startedAt: new Date().toISOString(),
    };
    this.external = null;
    this.activeProfile = p.name;
    const started = performance.now();
    const task = (async () => {
      // Fail closed before spawning if the intent cannot be recorded durably.
      await this.atomic("active-run.json", pending);
      let error: unknown;
      try {
        if (this.cancelRequested || this.stopping)
          this.runner.state = "cancelled";
        else await this.runner.run(p);
      } catch (e) {
        error = e;
      }
      const state = this.runner.state;
      const record: RunRecord = {
        ...pending,
        finishedAt: new Date().toISOString(),
        durationMs: performance.now() - started,
        state:
          state === "success"
            ? "success"
            : state === "cancelled"
              ? "cancelled"
              : "failure",
        exitCode: this.cancelRequested ? null : this.runner.exitCode,
        summary: error
          ? String(error).slice(0, 500)
          : this.cancelRequested
            ? "Cancelled; inspect external effects before retrying."
            : (this.runner.output.trim().split("\n").at(-1)?.slice(0, 500) ??
              ""),
      };
      this.history = [record, ...this.history].slice(0, 100);
      try {
        await this.atomic("history.json", this.history);
        await rm(path.join(this.directory, "active-run.json"));
      } catch (e) {
        this.recoveryBlocked = true;
        this.error(
          "RECOVERY_REQUIRED: result persistence failed; further execution blocked. " +
            String(e),
        );
        throw e;
      }
      if (error) throw error;
    })();
    this.runningTask = task;
    try {
      await task;
    } finally {
      this.runReserved = false;
      this.activeProfile = null;
      if (this.runningTask === task) this.runningTask = null;
      await this.tick();
      this.emit("change");
    }
  }
  private mutate(change: () => Promise<void>) {
    const result = this.configMutation.catch(() => {}).then(change);
    this.configMutation = result;
    return result;
  }
  save(value: unknown) {
    const p = profileSchema.parse(value);
    return this.mutate(async () => {
      if (this.busy) throw new Error("Cannot edit workflows during a run");
      const next = this.profiles.filter((x) => x.id !== p.id);
      if (next.length >= 100) throw new Error("Profile limit reached");
      next.push(p);
      for (const binding of Object.values(p.bindings)) {
        if (
          binding.kind === "run" &&
          binding.profileId &&
          !next.some((x) => x.id === binding.profileId)
        )
          throw new Error("A gesture references a missing workflow");
      }
      await this.writeConfiguration(next, p.id, this.target);
      this.profiles = next;
      this.selected = p.id;
      this.emit("change");
      await this.tick();
    });
  }
  select(id: string) {
    return this.mutate(async () => {
      if (!this.profiles.some((p) => p.id === id))
        throw new Error("PROFILE_NOT_FOUND");
      if (this.busy) throw new Error("Cannot switch workflows during a run");
      await this.writeConfiguration(this.profiles, id, this.target);
      this.selected = id;
      this.emit("change");
      await this.tick();
    });
  }
  async create(copy = false) {
    const current = this.profiles.find((p) => p.id === this.selected)!;
    const p: Profile = {
      ...structuredClone(current),
      id: randomUUID(),
      name: copy ? (current.name + " copy").slice(0, 80) : "New workflow",
      enabled: false,
      bindings: defaultBindings(),
    };
    await this.save(p);
  }
  remove(id: string) {
    return this.mutate(async () => {
      if (this.busy) throw new Error("Cannot delete during a run");
      if (this.profiles.length <= 1)
        throw new Error("Keep at least one workflow");
      const next = this.profiles.filter((p) => p.id !== id);
      if (next.length === this.profiles.length)
        throw new Error("PROFILE_NOT_FOUND");
      const refs = next.filter((p) =>
        Object.values(p.bindings).some(
          (b) => b.kind === "run" && b.profileId === id,
        ),
      );
      if (refs.length)
        throw new Error(
          "Used by gestures in: " +
            refs.map((p) => p.name).join(", ") +
            ". Change those bindings first.",
        );
      const selected = this.selected === id ? next[0].id : this.selected;
      await this.writeConfiguration(next, selected, this.target);
      this.profiles = next;
      this.selected = selected;
      this.emit("change");
    });
  }
  light(state: unknown) {
    const s = z.enum(states).parse(state);
    if (s === "running" || s === "disconnected")
      throw new Error("Reserved state");
    this.external = { state: s, until: performance.now() + 6000 };
    void this.tick();
  }
  press(g: unknown) {
    if (!(this.device instanceof VirtualDevice))
      throw new Error("Select simulator to simulate input");
    if (this.simulationPaused)
      throw new Error("Restore the simulated host link before pressing");
    this.device.press(z.enum(["press", "double", "hold"]).parse(g));
  }
  async simulate(value: unknown) {
    const mode = z.enum(["host-loss", "disconnect", "restore"]).parse(value);
    if (this.target !== "virtual:signalkey")
      throw new Error("Fault controls require the simulator");
    if (mode === "host-loss") this.simulationPaused = true;
    else if (mode === "disconnect") {
      this.device.close();
      this.simulationPaused = false;
    } else {
      await this.connect("virtual:signalkey");
    }
    this.emit("change");
  }
  private writeConfiguration(
    profiles: Profile[],
    selected: string,
    target: string,
  ) {
    return this.atomic("profiles.json", { profiles, selected, target });
  }
  private atomic(name: string, value: unknown) {
    const contents = JSON.stringify(value, null, 2);
    const operation = this.writing
      .catch(() => {})
      .then(async () => {
        const dest = path.join(this.directory, name);
        await writeFile(dest + ".tmp", contents, { mode: 0o600, flush: true });
        await rename(dest + ".tmp", dest);
      });
    this.writing = operation;
    return operation;
  }
  async persist() {
    await this.writeConfiguration(this.profiles, this.selected, this.target);
  }
  async close() {
    this.stopping = true;
    clearInterval(this.timer);
    await this.cancel();
    await this.runningTask?.catch(() => {});
    this.device.close();
    await this.writing;
  }
}
export type Snapshot = ReturnType<Service["snapshot"]>;
