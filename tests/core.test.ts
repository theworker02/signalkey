import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { decode, encode, Op, Freshness } from "../packages/protocol";
import {
  importProfile,
  defaultBindings,
  type Profile,
} from "../apps/desktop/core/profiles";
import { Runner } from "../apps/desktop/core/runner";
import { Service } from "../apps/desktop/core/service";
import { startApi } from "../apps/desktop/core/api";
import { SignalKey } from "../packages/sdk";
import { VirtualDevice } from "../apps/desktop/core/transport";
const profile: Profile = {
  version: 2,
  bindings: defaultBindings(),
  id: "test",
  name: "Test",
  executable: process.execPath,
  args: [path.resolve("examples/sample/project.mjs")],
  cwd: process.cwd(),
  timeoutMs: 10000,
  enabled: true,
  brightness: 32,
};
test("protocol strict bounds, version, padding and shared golden vector", async () => {
  const packet = encode({
    op: Op.HEARTBEAT,
    sequence: 0x1234,
    payload: new Uint8Array(),
  });
  const fixture = JSON.parse(
    await readFile("packages/protocol/golden.json", "utf8"),
  );
  assert.equal(Buffer.from(packet).toString("hex"), fixture.heartbeat);
  assert.equal(decode(packet).sequence, 0x1234);
  for (const length of [0, 1, 63, 65])
    assert.throws(() => decode(new Uint8Array(length)));
  for (const index of [0, 2, 3, 4, 7, 63]) {
    const bad = packet.slice();
    bad[index] = 255;
    assert.throws(() => decode(bad));
  }
  assert.throws(() =>
    encode({ op: 5, sequence: 0, payload: new Uint8Array(57) }),
  );
});
test("freshness handles expiry, recovery and backward clock", () => {
  const f = new Freshness();
  assert.equal(f.fresh(0), false);
  f.beat(100);
  assert.equal(f.fresh(6099), true);
  assert.equal(f.fresh(6100), false);
  assert.equal(f.fresh(99), false);
  f.beat(9000);
  assert.equal(f.fresh(9001), true);
});
test("profile import disables action and migrates v0", () => {
  assert.equal(importProfile(profile).enabled, false);
  assert.equal(
    importProfile({ ...profile, version: 0, brightness: undefined }).brightness,
    32,
  );
  assert.throws(() => importProfile({ ...profile, version: 99 }));
  assert.throws(() => importProfile({ ...profile, args: "echo hi" }));
  assert.throws(() => importProfile({ ...profile, timeoutMs: 0 }));
});
test("real process pass, fail, invalid executable and directory", async () => {
  const r = new Runner();
  await r.run(profile);
  assert.equal(r.state, "success");
  assert.match(r.output, /PASS/);
  await r.run({ ...profile, args: [...profile.args, "--fail"] });
  assert.equal(r.state, "failure");
  await r.run({ ...profile, executable: "signalkey-nonexistent-command" });
  assert.equal(r.state, "failure");
  await assert.rejects(() => r.run({ ...profile, enabled: false }), /DISABLED/);
  await assert.rejects(() =>
    r.run({ ...profile, cwd: path.join(process.cwd(), "absent-directory") }),
  );
  assert.equal(r.busy, false);
});
test("concurrency, cancellation, timeout and bounded output", async () => {
  const r = new Runner();
  const long = {
    ...profile,
    args: ["-e", 'setInterval(()=>console.log("waiting"),100)'],
  };
  const running = r.run(long);
  await new Promise((resolve) => setTimeout(resolve, 150));
  await assert.rejects(() => r.run(profile), /BUSY/);
  await r.stop();
  await running;
  assert.equal(r.state, "cancelled");
  await r.run({ ...long, timeoutMs: 200 });
  assert.equal(r.state, "failure");
  assert.match(r.output, /Timed out/);
  await r.run({ ...profile, args: ["-e", 'console.log("x".repeat(100000))'] });
  assert.ok(r.output.length <= 32768);
});
test("simulator pass/fail, authenticated SDK and persisted disabled imports", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "signalkey-"));
  const service = new Service(dir, process.cwd(), process.execPath);
  await service.init();
  const api = await startApi(service);
  try {
    const sdk = new SignalKey(api.connection);
    assert.equal((await sdk.devices()).length >= 1, true);
    assert.equal((await fetch(api.connection.url + "/status")).status, 403);
    assert.equal(
      (
        await fetch(api.connection.url + "/status", {
          headers: {
            Authorization: `Bearer ${api.connection.token}`,
            Origin: "https://evil.invalid",
          },
        })
      ).status,
      403,
    );
    const wait = () =>
      new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("run did not finish")),
          5000,
        );
        const listener = () => {
          if (
            !service.busy &&
            ["success", "failure"].includes(service.runner.state)
          ) {
            clearTimeout(timeout);
            service.off("change", listener);
            resolve();
          }
        };
        service.on("change", listener);
      });
    let done = wait();
    service.press("press");
    await done;
    assert.equal(service.runner.state, "success");
    done = wait();
    service.press("double");
    await done;
    assert.equal(service.runner.state, "failure");
    await sdk.light("success");
    assert.equal(service.state, "success");
    await service.save(importProfile({ ...profile, id: "imported" }));
    await assert.rejects(() => sdk.run("imported"));
    const restarted = new Service(dir, process.cwd(), process.execPath);
    await restarted.init();
    assert.equal(
      restarted.profiles.find((p) => p.id === "imported")?.enabled,
      false,
    );
    assert.equal(restarted.runner.state, "idle");
    await restarted.close();
  } finally {
    api.server.closeAllConnections();
    api.server.close();
    await service.close();
    await rm(dir, { recursive: true, force: true });
  }
});
test("virtual transport removal and heartbeat expiry", async () => {
  const v = new VirtualDevice();
  await v.send(Op.HEARTBEAT);
  await v.send(Op.SET_LIGHT, new Uint8Array([2]));
  assert.equal(v.state, "success");
  v.tick(performance.now() + 7000);
  assert.equal(v.state, "unknown");
  v.close();
  await assert.rejects(() => v.send(Op.HEARTBEAT), /DISCONNECTED/);
  assert.throws(() => v.press("press"));
});
