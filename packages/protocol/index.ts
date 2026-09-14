export const states = [
  "idle",
  "running",
  "success",
  "failure",
  "cancelled",
  "unknown",
  "disconnected",
] as const;
export type State = (typeof states)[number];
export const Op = {
  HELLO: 1,
  GET_CAPABILITIES: 2,
  GET_STATE: 3,
  BUTTON_EVENT: 4,
  SET_LIGHT: 5,
  SET_BRIGHTNESS: 6,
  HEARTBEAT: 7,
  ACK: 8,
  ERROR: 9,
} as const;
export type Packet = { op: number; sequence: number; payload: Uint8Array };
// 64-byte endpoint packet. node-hid writes prepend the unnumbered report ID (0).
export function encode({ op, sequence, payload }: Packet): Uint8Array {
  if (
    !Number.isInteger(op) ||
    op < 1 ||
    op > 9 ||
    !Number.isInteger(sequence) ||
    sequence < 0 ||
    sequence > 65535 ||
    payload.length > 56
  )
    throw new Error("INVALID_PACKET");
  const b = new Uint8Array(64);
  b.set([0x53, 0x4b, 1, 0, op, sequence & 255, sequence >> 8, payload.length]);
  b.set(payload, 8);
  return b;
}
export function decode(b: Uint8Array): Packet {
  if (
    b.length !== 64 ||
    b[0] !== 0x53 ||
    b[1] !== 0x4b ||
    b[2] !== 1 ||
    b[3] !== 0 ||
    b[4] < 1 ||
    b[4] > 9 ||
    b[7] > 56
  )
    throw new Error("INVALID_REPORT");
  if (b.slice(8 + b[7]).some((x) => x !== 0))
    throw new Error("NONZERO_PADDING");
  return {
    op: b[4],
    sequence: b[5] | (b[6] << 8),
    payload: b.slice(8, 8 + b[7]),
  };
}
export class Freshness {
  private last: number | null = null;
  constructor(readonly expiry = 6000) {}
  beat(now: number) {
    this.last = now;
  }
  fresh(now: number) {
    return (
      this.last !== null && now >= this.last && now - this.last < this.expiry
    );
  }
}
