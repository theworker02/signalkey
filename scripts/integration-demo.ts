import {
  _electron as electron,
  type ElectronApplication,
} from "@playwright/test";
import { mkdtemp, readFile, writeFile, mkdir, cp } from "node:fs/promises";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
const root = process.cwd();
const dir = await mkdtemp(path.join(os.tmpdir(), "signalkey-integration-"));
const userData = path.join(dir, "userdata");
await mkdir(userData);
const probe = path.join(dir, "probe.cjs"),
  effects = path.join(dir, "effects.txt");
await writeFile(
  probe,
  `require('fs').appendFileSync(${JSON.stringify(effects)},'started\\n'); setTimeout(()=>console.log('PROBE COMPLETE'),1500);`,
);
const current = path.resolve(
  "release/0.1.0-alpha.2-integration/SignalKey-win32-x64/SignalKey.exe",
);
const baseline = path.resolve(
  "release/0.1.0-alpha.2/SignalKey-win32-x64/SignalKey.exe",
);
const env = Object.fromEntries(Object.entries(process.env).filter((v):v is [string,string]=>v[1]!==undefined));
delete env.ELECTRON_RUN_AS_NODE;
let app: ElectronApplication | undefined;
const results: string[] = [];
async function launch(executablePath: string) {
  app = await electron.launch({
    executablePath,
    args: [`--user-data-dir=${userData}`],
    env,
  });
  const page = await app.firstWindow();
  await page
    .getByRole("heading", { name: "One press. A real result." })
    .waitFor();
  // Test-only native-dialog adapter. The real save IPC and approval branch still run.
  // This does NOT validate Windows dialog rendering or human approval interaction.
  await app.evaluate(({ dialog }) => {
    dialog.showMessageBox = async () => ({
      response: 1,
      checkboxChecked: false,
    });
  });
  return page;
}
async function quit() {
  await app!.close();
  app = undefined;
}
async function count() {
  return (await readFile(effects, "utf8").catch(() => ""))
    .split("\n")
    .filter(Boolean).length;
}
try {
  let page = await launch(baseline);
  await page
    .getByRole("button", { name: "Create workflow", exact: true })
    .click();
  await page
    .getByLabel("Workflow name", { exact: true })
    .fill("Integration probe");
  await page.getByLabel(/^Executable/).fill(process.execPath);
  await page.getByLabel(/^Arguments/).fill(JSON.stringify([probe]));
  await page.getByLabel(/^Working directory/).fill(dir);
  await page.getByRole("tab", { name: "Gestures", exact: true }).click();
  await page.getByLabel("Double press", { exact: true }).selectOption("cancel");
  await page.getByLabel("Enable this reviewed workflow").check();
  await page
    .getByRole("button", { name: "Save workflow", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Workflow saved." })
    .waitFor();
  await page
    .getByRole("button", { name: "Press Run selected", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      document.querySelector(".state-text strong")?.textContent === "success",
  );
  assert.equal(await count(), 1);
  await quit();
  const before = await readFile(path.join(userData, "profiles.json"));
  results.push(
    "alpha.2 UI: create profile, set executable/arguments/cwd, assign double-cancel, enable through approval adapter, press, real process success",
  );
  page = await launch(current);
  await page
    .getByRole("heading", { name: "Integration probe", exact: true })
    .waitFor();
  assert.deepEqual(
    await readFile(path.join(userData, "profiles.json")),
    before,
  );
  await page.getByRole("tab", { name: "Gestures", exact: true }).click();
  assert.equal(
    await page.getByLabel("Double press", { exact: true }).inputValue(),
    "cancel",
  );
  assert.equal(await count(), 1);
  results.push(
    "full process restart + baseline-to-integration portable upgrade preserves profile bytes, selected workflow, bindings and history; no launch on startup",
  );
  const snapshot = (await page.evaluate(
    async () => await window.signalkey.invoke("snapshot"),
  )) as { selected: string };
  const outcomes = await page.evaluate(
    async (id) =>
      Promise.allSettled([
        window.signalkey.invoke("run", id),
        window.signalkey.invoke("run", id),
      ]),
    snapshot.selected,
  );
  assert.equal(outcomes.filter((x) => x.status === "rejected").length, 1);
  assert.equal(await count(), 2);
  results.push(
    "concurrent run IPC requests: one rejected, exactly one new external side effect",
  );
  await page
    .getByRole("button", { name: "Press Run selected", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      document.querySelector(".state-text strong")?.textContent === "running",
  );
  // Wait until the child has produced an observable side effect before forcing exit.
  for (let i = 0; i < 100 && (await count()) < 3; i++)
    await new Promise((r) => setTimeout(r, 20));
  assert.equal(await count(), 3);
  await app!.evaluate(({ app }) => app.exit(77)).catch(() => {});
  app = undefined;
  page = await launch(current);
  const recovered = (await page.evaluate(
    async () => await window.signalkey.invoke("snapshot"),
  )) as { history: { state: string }[] };
  assert.equal(recovered.history[0].state, "interrupted");
  await new Promise((r) => setTimeout(r, 1700));
  assert.equal(await count(), 3);
  results.push(
    "forced main-process exit after real child side effect: restart records interrupted/unknown, does not retry",
  );
  await page.evaluate(() => window.signalkey.invoke("simulate", "disconnect"));
  await assert.rejects(
    page.evaluate(() => window.signalkey.invoke("press", "press")),
  );
  await page.evaluate(() => window.signalkey.invoke("simulate", "restore"));
  assert.equal(await count(), 3);
  results.push(
    "simulated disconnect rejects gesture; reconnect never replays action",
  );
  await page.getByRole("tab", { name: /Run history/ }).click();
  await page.getByRole("cell", { name: "interrupted", exact: true }).waitFor();
  await mkdir("docs/evidence", { recursive: true });
  await page.screenshot({
    path: "docs/evidence/integration-recovery.png",
    fullPage: true,
  });
  await quit();
  // Reinstall/relocation uses a second full copy; original package and user data remain intact.
  const reinstall = path.join(dir, "reinstalled");
  await cp(path.dirname(current), reinstall, { recursive: true });
  page = await launch(path.join(reinstall, "SignalKey.exe"));
  await page
    .getByRole("heading", { name: "Integration probe", exact: true })
    .waitFor();
  assert.deepEqual(
    await readFile(path.join(userData, "profiles.json")),
    before,
  );
  assert.equal(await count(), 3);
  results.push(
    "portable reinstall at different path reuses external userData with byte-identical custom profiles",
  );
  await quit();
  await writeFile(
    "docs/evidence/integration-demo.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        platform: process.platform,
        os: os.release(),
        node: process.version,
        baseline,
        current,
        currentExeSha256: createHash("sha256")
          .update(await readFile(current))
          .digest("hex"),
        results,
        physicalHardware: false,
        nativeApprovalDialog:
          "test adapter; native human interaction not tested",
        cleanMachine: false,
        uninstall:
          "portable folder removal not executed; relocation/reinstall tested",
        userData,
        limitations: [
          "Forced exit can leave child effects; no exactly-once guarantee for arbitrary external commands",
          "Old alpha.2 cannot read new interrupted history records; back up before downgrade",
          "No installer/MSI or signature; portable test distribution only",
        ],
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ passed: results.length, results }, null, 2));
} finally {
  if (app) await quit();
}
