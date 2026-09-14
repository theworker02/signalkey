import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { Service } from "../apps/desktop/core/service";
import { startApi } from "../apps/desktop/core/api";
import { SignalKey } from "../packages/sdk";
test("SDK press subscription delivers and removes listener; oversized bodies are rejected", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "signalkey-api-"));
  const service = new Service(directory, process.cwd(), process.execPath);
  await service.init();
  const api = await startApi(service);
  const abort = new AbortController();
  try {
    const client = new SignalKey(api.connection);
    let gesture = "";
    const subscription = client
      .presses((g) => {
        gesture = g;
        abort.abort();
      }, abort.signal)
      .catch((e) => {
        if (!abort.signal.aborted) throw e;
      });
    const deadline = Date.now() + 5000;
    while (service.listenerCount("press") === 0) {
      if (Date.now() > deadline)
        throw new Error("Subscription not established");
      await new Promise((r) => setTimeout(r, 20));
    }
    service.emit("press", "hold");
    await subscription;
    assert.equal(gesture, "hold");
    await new Promise((r) => setTimeout(r, 50));
    assert.equal(service.listenerCount("press"), 0);
    const response = await fetch(api.connection.url + "/light", {
      method: "POST",
      headers: { Authorization: `Bearer ${api.connection.token}` },
      body: "x".repeat(9000),
    });
    assert.equal(response.status, 413);
  } finally {
    abort.abort();
    api.server.closeAllConnections();
    api.server.close();
    await service.close();
    await rm(directory, { recursive: true, force: true });
  }
});
