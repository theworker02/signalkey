import { _electron as electron } from "@playwright/test";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
const userData = await mkdtemp(path.join(os.tmpdir(), "signalkey-desktop-"));
const env = Object.fromEntries(
  Object.entries(process.env).filter(
    (entry): entry is [string, string] => entry[1] !== undefined,
  ),
);
delete env.ELECTRON_RUN_AS_NODE;
const packaged = process.env.SIGNALKEY_EXECUTABLE;
const app = await electron.launch({
  ...(packaged ? { executablePath: packaged } : {}),
  args: [...(packaged ? [] : ["."]), `--user-data-dir=${userData}`],
  env,
});
try {
  const page = await app.firstWindow();
  await page
    .getByRole("heading", { name: "One press. A real result." })
    .waitFor();
  await page
    .getByRole("button", {
      name: "Simulate a single press to run the selected profile",
    })
    .click();
  await page.waitForFunction(
    () =>
      document.querySelector(".state-text strong")?.textContent === "success",
  );
  assert.match(await page.getByLabel("Command output").innerText(), /PASS/);
  await page
    .getByRole("button", { name: "Double press Sample · failing tests" })
    .click();
  await page.waitForFunction(
    () =>
      document.querySelector(".state-text strong")?.textContent === "failure",
  );
  assert.match(
    await page.getByLabel("Command output").innerText(),
    /AssertionError/,
  );
  await page
    .getByRole("button", { name: "Press Run selected", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      document.querySelector(".state-text strong")?.textContent === "success",
  );
  await mkdir("docs/evidence", { recursive: true });
  await page.getByRole("tab", { name: /Run history/ }).click();
  await page
    .getByRole("cell", { name: "button", exact: true })
    .first()
    .waitFor();
  assert.equal(await page.locator("tbody tr").count(), 3);
  await page.getByRole("tab", { name: "Output", exact: true }).click();
  await page
    .getByRole("button", { name: "Create workflow", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "New workflow", exact: true })
    .waitFor();
  await page
    .getByLabel("Workflow name", { exact: true })
    .fill("My build workflow");
  await page.getByRole("tab", { name: "Gestures", exact: true }).click();
  await page.getByLabel("Double press", { exact: true }).selectOption("cancel");
  await page
    .getByRole("button", { name: "Save workflow", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Workflow saved." })
    .waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "▶ Run workflow", exact: true })
      .isDisabled(),
    true,
  );
  await page.reload();
  await page
    .getByRole("heading", { name: "My build workflow", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "⌘ Sample · passing tests Ready to run" })
    .click();
  await page.getByText("Test a connection failure", { exact: true }).click();
  await page
    .getByRole("button", { name: "Pause host link", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      document.querySelector(".state-text strong")?.textContent === "unknown",
    {},
    { timeout: 8000 },
  );
  await page.getByRole("button", { name: "Restore", exact: true }).click();
  await page
    .getByRole("button", { name: "Press Run selected", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      document.querySelector(".state-text strong")?.textContent === "success",
  );
  await page.getByText("Test a connection failure", { exact: true }).click();
  await page.screenshot({
    path: "docs/evidence/desktop-success.png",
    fullPage: true,
  });
  const security = await app.evaluate(({ BrowserWindow }) => {
    const contents = BrowserWindow.getAllWindows()[0]
      .webContents as Electron.WebContents & {
      getLastWebPreferences(): Electron.WebPreferences;
    };
    const prefs = contents.getLastWebPreferences();
    return {
      contextIsolation: prefs.contextIsolation,
      nodeIntegration: prefs.nodeIntegration,
      sandbox: prefs.sandbox,
    };
  });
  assert.deepEqual(security, {
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
  });
  await page.evaluate(() => window.signalkey.invoke("devices"));
  const status = (await page.evaluate(() =>
    window.signalkey.invoke("snapshot"),
  )) as { errors: string[] };
  assert.ok(!status.errors.some((e) => e.includes("HID unavailable")));
  console.log(
    JSON.stringify({
      desktop: "PASS → FAILURE → PASS observed through UI",
      security,
      nativeHidEnumeration: true,
      profileCreateEditReload: true,
      disabledProfileCannotRun: true,
      historyDisplayed: true,
      staleHeartbeatAndRecovery: true,
      userData,
    }),
  );
  await writeFile(
    `docs/evidence/${packaged ? "packaged" : "desktop"}-smoke.json`,
    JSON.stringify(
      {
        date: new Date().toISOString(),
        desktop: "PASS → FAILURE → PASS observed through UI",
        security,
        nativeHidEnumeration: true,
        profileCreateEditReload: true,
        disabledProfileCannotRun: true,
        historyDisplayed: true,
        staleHeartbeatAndRecovery: true,
        platform: process.platform,
        osRelease: os.release(),
        electron: await app.evaluate(() => process.versions.electron),
      },
      null,
      2,
    ),
  );
} catch (error) {
  const failed = app.windows()[0];
  if (failed) {
    await failed.screenshot({
      path: "docs/evidence/desktop-failure-debug.png",
      fullPage: true,
    });
    console.error(
      await failed
        .evaluate(async () => {
          const s = (await window.signalkey.invoke("snapshot")) as {
            selected: string;
            profiles: { id: string; name: string }[];
          };
          return {
            selected: s.selected,
            profiles: s.profiles.map((p) => ({ id: p.id, name: p.name })),
          };
        })
        .catch(String),
    );
  }
  throw error;
} finally {
  await app.close();
}
