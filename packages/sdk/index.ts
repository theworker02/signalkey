import { readFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type { State } from "../protocol";
export class SignalKey {
  constructor(private connection: { url: string; token: string }) {
    const u = new URL(connection.url);
    if (u.hostname !== "127.0.0.1" || u.protocol !== "http:")
      throw new Error("Only local SignalKey connections are allowed");
  }
  static async local(
    file = process.env.SIGNALKEY_CONNECTION ??
      path.join(
        process.env.APPDATA ?? path.join(os.homedir(), ".config"),
        "SignalKey",
        "sdk.json",
      ),
  ) {
    return new SignalKey(JSON.parse(await readFile(file, "utf8")));
  }
  async request(route: string, body?: unknown) {
    const response = await fetch(this.connection.url + route, {
      method: body ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${this.connection.token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok)
      throw new Error(`SignalKey ${response.status}: ${await response.text()}`);
    return response.json();
  }
  devices() {
    return this.request("/devices");
  }
  status() {
    return this.request("/status");
  }
  run(id: string) {
    return this.request("/run", { id });
  }
  light(state: State) {
    return this.request("/light", { state });
  }
  async presses(callback: (gesture: string) => void, signal: AbortSignal) {
    const response = await fetch(this.connection.url + "/events", {
      headers: { Authorization: `Bearer ${this.connection.token}` },
      signal,
    });
    if (!response.ok || !response.body)
      throw new Error("Event subscription failed");
    let buffer = "";
    for await (const chunk of response.body.pipeThrough(
      new TextDecoderStream(),
    )) {
      buffer += chunk;
      let index: number;
      while ((index = buffer.indexOf("\n\n")) >= 0) {
        const event = buffer.slice(0, index);
        buffer = buffer.slice(index + 2);
        if (event.startsWith("data: "))
          callback(JSON.parse(event.slice(6)).gesture);
      }
    }
  }
}
