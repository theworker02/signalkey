import { EventEmitter } from "node:events";
import {
  decode,
  encode,
  Freshness,
  Op,
  states,
  type State,
} from "../../../packages/protocol";
export type Gesture = "press" | "double" | "hold";
interface HidHandle {
  on(event: "data", listener: (data: Buffer) => void): unknown;
  on(event: "error", listener: (error: Error) => void): unknown;
  write(data: number[]): number;
  close(): void;
}
export interface Transport extends EventEmitter {
  id: string;
  connected: boolean;
  state: State;
  capabilities: {
    flags: number;
    ledCount: number;
    brightnessCeiling: number;
  } | null;
  send(op: number, payload?: Uint8Array): Promise<Uint8Array>;
  readState(): Promise<State>;
  close(): void;
}
export class VirtualDevice extends EventEmitter implements Transport {
  capabilities = { flags: 7, ledCount: 12, brightnessCeiling: 64 };
  brightness = 32;
  id = "virtual:signalkey";
  connected = true;
  state: State = "unknown";
  private sequence = 0;
  private clock = new Freshness();
  async send(op: number, payload = new Uint8Array()) {
    if (!this.connected) throw new Error("DEVICE_DISCONNECTED");
    const packet = decode(
      encode({ op, sequence: this.sequence++ % 65536, payload }),
    );
    if (packet.op === Op.HEARTBEAT) this.clock.beat(performance.now());
    if (packet.op === Op.SET_LIGHT) {
      if (!states[payload[0]]) throw new Error("INVALID_STATE");
      this.state = states[payload[0]];
    }
    if (packet.op === Op.SET_BRIGHTNESS) {
      if (payload.length !== 1 || payload[0] > 64)
        throw new Error("INVALID_BRIGHTNESS");
      this.brightness = payload[0];
    }
    if (packet.op === Op.GET_STATE)
      return new Uint8Array([op, states.indexOf(this.state), this.brightness]);
    if (packet.op === Op.GET_CAPABILITIES)
      return new Uint8Array([op, 7, 12, 64]);
    return new Uint8Array([op]);
  }
  async readState() {
    this.tick();
    return this.state;
  }
  tick(now = performance.now()) {
    if (!this.connected) return;
    if (!this.clock.fresh(now)) this.state = "unknown";
  }
  press(g: Gesture) {
    if (!this.connected) throw new Error("DEVICE_DISCONNECTED");
    this.emit("press", g);
  }
  close() {
    this.connected = false;
    this.state = "disconnected";
    this.emit("disconnect");
  }
}
export class HidDevice extends EventEmitter implements Transport {
  capabilities: {
    flags: number;
    ledCount: number;
    brightnessCeiling: number;
  } | null = null;
  connected = true;
  state: State = "unknown";
  private sequence = 0;
  private buttons = new Set<number>();
  private buttonWindow = 0;
  private buttonCount = 0;
  private pending = new Map<
    number,
    {
      op: number;
      resolve: (payload: Uint8Array) => void;
      reject: (e: Error) => void;
      timer: NodeJS.Timeout;
    }
  >();
  constructor(
    public id: string,
    private handle: HidHandle,
  ) {
    super();
    handle.on("data", (b) => this.receive(b));
    handle.on("error", () => this.close());
  }
  static async discover() {
    const hid = await import("node-hid");
    return hid
      .devices()
      .filter(
        (d) =>
          d.usagePage === 0xff00 &&
          d.usage === 1 &&
          d.serialNumber?.startsWith("SK-"),
      )
      .map((d) => ({
        id: `hid:${d.serialNumber}`,
        path: d.path!,
        name: d.product ?? "SignalKey prototype",
      }));
  }
  static async open(id: string) {
    const devices = await this.discover();
    const matches = devices.filter((x) => x.id === id);
    if (matches.length !== 1)
      throw new Error("Device absent or duplicate serial identity");
    const hid = await import("node-hid");
    const device = new HidDevice(id, new hid.HID(matches[0].path));
    try {
      await device.send(Op.HELLO);
      const caps = await device.send(Op.GET_CAPABILITIES);
      if (
        caps.length !== 4 ||
        (caps[1] & 7) !== 7 ||
        caps[2] < 1 ||
        caps[2] > 64 ||
        caps[3] < 1 ||
        caps[3] > 64
      )
        throw new Error("INCOMPATIBLE_CAPABILITIES");
      device.capabilities = {
        flags: caps[1],
        ledCount: caps[2],
        brightnessCeiling: caps[3],
      };
      await device.readState();
      return device;
    } catch (e) {
      device.close();
      throw e;
    }
  }
  private receive(b: Buffer) {
    try {
      const p = decode(b);
      if (p.op === Op.BUTTON_EVENT) {
        if (p.payload.length !== 1 || this.buttons.has(p.sequence)) return;
        if (performance.now() - this.buttonWindow >= 1000) {
          this.buttonWindow = performance.now();
          this.buttonCount = 0;
        }
        if (++this.buttonCount > 10) return;
        this.buttons.add(p.sequence);
        if (this.buttons.size > 64)
          this.buttons.delete(this.buttons.values().next().value!);
        const g = (["press", "double", "hold"] as const)[p.payload[0]];
        if (g) this.emit("press", g);
        return;
      }
      const pending = this.pending.get(p.sequence);
      if (pending && (p.op === Op.ACK || p.op === Op.ERROR)) {
        if (
          p.op === Op.ACK &&
          (p.payload[0] !== pending.op ||
            p.payload.length !==
              (pending.op === Op.GET_STATE
                ? 3
                : pending.op === Op.GET_CAPABILITIES
                  ? 4
                  : 1))
        )
          return;
        if (
          p.op === Op.ERROR &&
          (p.payload.length !== 2 || p.payload[1] !== pending.op)
        )
          return;
        clearTimeout(pending.timer);
        this.pending.delete(p.sequence);
        if (p.op === Op.ERROR)
          pending.reject(new Error(`DEVICE_ERROR_${p.payload[0]}`));
        else pending.resolve(p.payload);
      }
    } catch {
      this.emit("protocol-error", "Malformed HID report ignored");
    }
  }
  async send(op: number, payload = new Uint8Array()) {
    if (!this.connected) throw new Error("DEVICE_DISCONNECTED");
    if (this.pending.size >= 16) throw new Error("DEVICE_BUSY");
    const sequence = this.sequence++ % 65536;
    const result = await new Promise<Uint8Array>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(sequence);
        reject(new Error("ACK_TIMEOUT"));
      }, 1000);
      this.pending.set(sequence, { op, resolve, reject, timer });
      try {
        this.handle.write([0, ...encode({ op, sequence, payload })]);
      } catch (e) {
        clearTimeout(timer);
        this.pending.delete(sequence);
        reject(e);
      }
    });
    if (op === Op.SET_LIGHT) this.state = states[payload[0]];
    return result;
  }
  async readState() {
    const payload = await this.send(Op.GET_STATE);
    if (!states[payload[1]] || payload[2] > 64)
      throw new Error("INVALID_DEVICE_STATE");
    this.state = states[payload[1]];
    return this.state;
  }
  close() {
    if (!this.connected) return;
    this.connected = false;
    this.state = "disconnected";
    for (const p of this.pending.values()) {
      clearTimeout(p.timer);
      p.reject(new Error("DEVICE_REMOVED"));
    }
    this.pending.clear();
    this.handle.close();
    this.emit("disconnect");
  }
}
