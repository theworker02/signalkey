import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Service } from "../apps/desktop/core/service";

async function fixture() {
  const dir = await mkdtemp(path.join(os.tmpdir(), "signalkey-recovery-"));
  const s = new Service(dir, process.cwd(), process.execPath);
  await s.init();
  await s.save({
    ...s.profiles[0],
    id: "probe",
    name: "Probe",
    executable: process.execPath,
    args: ["-e", "setTimeout(()=>console.log('done'),150)"],
    enabled: true,
  });
  return { dir, s };
}
test("admission reserves before journal I/O; simultaneous duplicate executes once", async () => {
  const { s, dir } = await fixture();
  try {
    const first = s.run("probe");
    await assert.rejects(s.run("probe"), /BUSY/);
    await first;
    assert.equal(s.history.length, 1);
    assert.equal(s.history[0].state, "success");
    await assert.rejects(readFile(path.join(dir, "active-run.json")), {
      code: "ENOENT",
    });
    await s.save({
      ...s.profiles.find((p) => p.id === "probe")!,
      cwd: "relative",
    });
    await assert.rejects(s.run("probe"), /absolute/);
    assert.equal(s.history[0].state, "failure");
  } finally {
    await s.close();
  }
});
test("cancel during journal write prevents launch; unavailable journal fails closed", async () => {
  const { s, dir } = await fixture();
  try {
    const work = s.run("probe");
    await s.cancel();
    await work;
    assert.equal(s.history[0].state, "cancelled");
    assert.equal(s.runner.startedAt, null);
    await mkdir(path.join(dir, "active-run.json.tmp"));
    await assert.rejects(s.run("probe"));
    assert.equal(s.runner.startedAt, null);
  } finally {
    await s.close().catch(() => {});
  }
});
test("unknown interrupted outcome reconciles once across restarts without executing", async () => {
  const { s, dir } = await fixture();
  await s.close();
  await writeFile(
    path.join(dir, "active-run.json"),
    JSON.stringify({
      id: "crash-1",
      profileId: "probe",
      profileName: "Probe",
      source: "desktop",
      startedAt: new Date().toISOString(),
    }),
  );
  for (let i = 0; i < 2; i++) {
    const next = new Service(dir, process.cwd(), process.execPath);
    try {
      await next.init();
      assert.equal(next.history.length, 1);
      assert.equal(next.history[0].state, "interrupted");
      assert.equal(next.runner.startedAt, null);
    } finally {
      await next.close();
    }
  }
});
test("malformed active-run record blocks launch and preserves evidence", async () => {
  const { s, dir } = await fixture();
  await s.close();
  await writeFile(path.join(dir, "active-run.json"), "broken");
  const next = new Service(dir, process.cwd(), process.execPath);
  try {
    await next.init();
    await assert.rejects(next.run("probe"), /RECOVERY_REQUIRED/);
    assert.equal(
      await readFile(path.join(dir, "active-run.json"), "utf8"),
      "broken",
    );
  } finally {
    await next.close();
  }
});

test("conflicting edits fail without changing mappings; device loss does not replay an active action", async () => {
  const {s}=await fixture();
  try {
    const profile=structuredClone(s.profiles.find(p=>p.id==="probe")!);
    await assert.rejects(s.save({...profile,bindings:{...profile.bindings,press:{kind:"run",profileId:"missing"}}}),/missing workflow/);
    assert.deepEqual(s.profiles.find(p=>p.id==="probe"),profile);
    const work=s.run("probe");
    await assert.rejects(s.save({...profile,name:"changed while running"}),/during a run/);
    await s.simulate("disconnect");
    await work;
    assert.equal(s.history.length,1);
    assert.equal(s.history[0].state,"success");
    await s.simulate("restore");
    assert.equal(s.history.length,1);
  } finally {await s.close();}
});
