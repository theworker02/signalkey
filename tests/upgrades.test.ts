import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, readdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Service } from "../apps/desktop/core/service";
import { importProfile, migrateProfile } from "../apps/desktop/core/profiles";
async function fixture() {
  const dir = await mkdtemp(path.join(os.tmpdir(), "signalkey-upgrade-"));
  const service = new Service(dir, process.cwd(), process.execPath);
  await service.init();
  return {
    service,
    dir,
    close: async () => {
      await service.close();
      await rm(dir, { recursive: true, force: true });
    },
  };
}
test("v1 migration preserves local bindings while imports cannot reference enabled local workflows", async () => {
  const f = await fixture();
  try {
    const { bindings, ...old } = f.service.profiles[0];
    const migrated = migrateProfile({ ...old, version: 1 });
    assert.equal(migrated.version, 2);
    assert.deepEqual(migrated.bindings.double, {
      kind: "run",
      profileId: "sample-fail",
    });
    const imported = importProfile(migrated);
    assert.equal(imported.enabled, false);
    assert.deepEqual(imported.bindings.double, { kind: "run" });
  } finally {
    await f.close();
  }
});
test("create, duplicate, referenced deletion protection, and selection persist", async () => {
  const f = await fixture();
  try {
    await assert.rejects(() => f.service.remove("sample-fail"), /Used by/);
    await f.service.create();
    const id = f.service.selected;
    assert.equal(f.service.profiles.find((p) => p.id === id)?.enabled, false);
    await f.service.create(true);
    assert.equal(f.service.profiles.length, 4);
    await f.service.remove(id);
    assert.equal(f.service.profiles.length, 3);
    const saved = JSON.parse(
      await readFile(path.join(f.dir, "profiles.json"), "utf8"),
    );
    assert.equal(saved.selected, f.service.selected);
  } finally {
    await f.close();
  }
});
test("history survives restart without restoring a current success state", async () => {
  const f = await fixture();
  try {
    await f.service.run("sample-pass", "sdk");
    assert.equal(f.service.history[0].state, "success");
    assert.equal(f.service.history[0].exitCode, 0);
    assert.equal(f.service.history[0].source, "sdk");
    assert.ok(f.service.history[0].durationMs > 0);
    assert.ok(f.service.runner.launchMs !== null);
    const other = new Service(f.dir, process.cwd(), process.execPath);
    await other.init();
    assert.equal(other.history.length, 1);
    assert.equal(other.runner.state, "idle");
    await other.close();
  } finally {
    await f.close();
  }
});
test("disconnected virtual state stays disconnected and restore never reruns a command", async () => {
  const f = await fixture();
  try {
    await f.service.simulate("disconnect");
    await f.service.tick();
    assert.equal(f.service.device.state, "disconnected");
    assert.throws(() => f.service.press("press"), /DISCONNECTED/);
    await f.service.simulate("restore");
    assert.equal(f.service.state, "unknown");
    assert.equal(f.service.history.length, 0);
  } finally {
    await f.close();
  }
});
test("malformed saved configuration is preserved before recovery", async () => {
  const f = await fixture();
  await f.service.close();
  await writeFile(path.join(f.dir, "profiles.json"), "{broken");
  const recovery = new Service(f.dir, process.cwd(), process.execPath);
  try {
    await recovery.init();
    assert.equal(recovery.profiles.length, 2);
    const backup = (await readdir(f.dir)).find((x) =>
      x.startsWith("profiles.recovery-"),
    );
    assert.ok(backup);
    assert.equal(await readFile(path.join(f.dir, backup), "utf8"), "{broken");
  } finally {
    await recovery.close();
    await rm(f.dir, { recursive: true, force: true });
  }
});
test("a no-action gesture does not execute; changed binding executes only its enabled target", async () => {
  const f = await fixture();
  try {
    const p = structuredClone(f.service.profiles[0]);
    p.bindings.press = { kind: "none" };
    await f.service.save(p);
    f.service.press("press");
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(f.service.runner.busy, false);
    assert.equal(f.service.history.length, 0);
    p.bindings.press = { kind: "run", profileId: "absent" };
    await assert.rejects(() => f.service.save(p), /missing/);
  } finally {
    await f.close();
  }
});
