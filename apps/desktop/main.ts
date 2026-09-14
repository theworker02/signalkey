import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Tray,
  Menu,
  nativeImage,
  powerMonitor,
} from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readFile, writeFile, stat } from "node:fs/promises";
import { Service } from "./core/service";
import { startApi } from "./core/api";
import { importProfile, profileSchema } from "./core/profiles";
app.setName("SignalKey");
let quitting = false;
let tray: Tray;
let win: BrowserWindow;
let service: Service;
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", () => {
    win?.show();
    win?.focus();
  });
  void app
    .whenReady()
    .then(async () => {
      const root = app.getAppPath();
      const file = path.join(root, "dist/ui/index.html");
      const expected = pathToFileURL(file).href;
      service = new Service(app.getPath("userData"), root, process.execPath);
      await service.init();
      const api = await startApi(service);
      win = new BrowserWindow({
        width: 1400,
        height: 950,
        minWidth: 820,
        minHeight: 640,
        backgroundColor: "#111318",
        title: "SignalKey · Magnexis",
        webPreferences: {
          preload: path.join(root, "dist/preload.cjs"),
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
        },
      });
      win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
      win.webContents.on("will-navigate", (e) => e.preventDefault());
      win.webContents.session.setPermissionRequestHandler((_w, _p, callback) =>
        callback(false),
      );
      ipcMain.handle(
        "signalkey",
        async (event, command: unknown, value: unknown) => {
          if (
            event.sender !== win.webContents ||
            event.senderFrame !== win.webContents.mainFrame ||
            event.senderFrame.url !== expected
          )
            throw new Error("UNTRUSTED_SENDER");
          if (command === "snapshot") return service.snapshot();
          if (command === "devices") return service.devices();
          if (command === "press") return service.press(value);
          if (command === "cancel") return service.cancel();
          if (command === "run" && typeof value === "string")
            return service.run(value, "desktop");
          if (command === "create") return service.create(false);
          if (command === "duplicate") return service.create(true);
          if (command === "simulate") return service.simulate(value);
          if (command === "light") return service.light(value);
          if (command === "delete" && typeof value === "string") {
            const result = await dialog.showMessageBox(win, {
              type: "question",
              buttons: ["Keep workflow", "Delete workflow"],
              defaultId: 0,
              cancelId: 0,
              message: "Delete this workflow?",
              detail:
                "Run history is retained. Workflows referenced by other gesture bindings cannot be deleted.",
            });
            if (result.response !== 1) throw new Error("Deletion cancelled");
            return service.remove(value);
          }
          if (command === "choose-executable") {
            const result = await dialog.showOpenDialog(win, {
              properties: ["openFile"],
              title: "Choose a trusted executable",
            });
            return result.canceled ? null : result.filePaths[0];
          }
          if (command === "choose-directory") {
            const result = await dialog.showOpenDialog(win, {
              properties: ["openDirectory"],
              title: "Choose working directory",
            });
            return result.canceled ? null : result.filePaths[0];
          }
          if (command === "export-history") {
            const result = await dialog.showSaveDialog(win, {
              defaultPath: "signalkey-run-history.json",
              filters: [{ name: "JSON", extensions: ["json"] }],
            });
            if (result.filePath)
              await writeFile(
                result.filePath,
                JSON.stringify(
                  { version: 1, history: service.history },
                  null,
                  2,
                ),
              );
            return;
          }
          if (command === "save") {
            const profile = profileSchema.parse(value);
            const old = service.profiles.find((p) => p.id === profile.id);
            if (
              profile.enabled &&
              (!old?.enabled ||
                old.executable !== profile.executable ||
                old.cwd !== profile.cwd ||
                JSON.stringify(old.bindings) !==
                  JSON.stringify(profile.bindings) ||
                JSON.stringify(old.args) !== JSON.stringify(profile.args))
            ) {
              const result = await dialog.showMessageBox(win, {
                type: "warning",
                buttons: ["Cancel", "Enable command"],
                defaultId: 0,
                cancelId: 0,
                title: "Review local command",
                message: "Allow SignalKey to run this command?",
                detail: `Executable: ${profile.executable}\nArguments: ${JSON.stringify(profile.args)}\nDirectory: ${profile.cwd}\nGestures: ${JSON.stringify(profile.bindings)}\n\nIt runs with your user permissions. Only enable commands you trust.`,
              });
              if (result.response !== 1)
                throw new Error("Command was not enabled");
            }
            return service.save(profile);
          }
          if (command === "select" && typeof value === "string")
            return service.select(value);
          if (command === "connect" && typeof value === "string")
            return service.connect(value);
          if (command === "import") {
            const selected = await dialog.showOpenDialog(win, {
              filters: [{ name: "SignalKey profile", extensions: ["json"] }],
              properties: ["openFile"],
            });
            if (selected.canceled) return;
            const file = selected.filePaths[0];
            if ((await stat(file)).size > 65536)
              throw new Error("Profile file exceeds 64 KiB");
            const profile = importProfile(
              JSON.parse(await readFile(file, "utf8")),
            );
            profile.id = `import-${Date.now()}`;
            await service.save(profile);
            return;
          }
          if (command === "export") {
            const profile = service.profiles.find(
              (p) => p.id === service.selected,
            );
            if (!profile) throw new Error("Profile missing");
            const result = await dialog.showSaveDialog(win, {
              defaultPath: `${profile.id}.json`,
              filters: [{ name: "SignalKey profile", extensions: ["json"] }],
            });
            if (result.filePath)
              await writeFile(
                result.filePath,
                JSON.stringify(profile, null, 2),
              );
            return;
          }
          if (command === "login" && typeof value === "boolean") {
            app.setLoginItemSettings({ openAtLogin: value });
            return app.getLoginItemSettings().openAtLogin;
          }
          if (command === "preferences")
            return { login: app.getLoginItemSettings().openAtLogin };
          if (command === "quit") {
            app.quit();
            return;
          }
          throw new Error("UNKNOWN_COMMAND");
        },
      );
      win.on("close", (e) => {
        if (!quitting) {
          e.preventDefault();
          win.hide();
        }
      });
      const icon = nativeImage.createFromDataURL(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAFElEQVR42mNkYPj/n4ECwESJ5lEDAAALnQIfZ6Y4JwAAAABJRU5ErkJggg==",
      );
      tray = new Tray(icon);
      tray.setToolTip("SignalKey — local workflow button");
      tray.setContextMenu(
        Menu.buildFromTemplate([
          { label: "Open SignalKey", click: () => win.show() },
          { label: "Quit", click: () => app.quit() },
        ]),
      );
      tray.on("double-click", () => win.show());
      powerMonitor.on("suspend", () => {
        service.device.close();
        void service.cancel();
      });
      powerMonitor.on("resume", () => {
        if (service.target === "virtual:signalkey")
          void service.connect(service.target).catch((e) => service.error(e));
        else void service.tick();
      });
      app.on("before-quit", (e) => {
        if (quitting) return;
        e.preventDefault();
        quitting = true;
        api.server.closeAllConnections();
        api.server.close();
        void service.close().finally(() => app.quit());
      });
      await win.loadFile(file);
    })
    .catch((e) => {
      dialog.showErrorBox("SignalKey failed to start", String(e));
      app.exit(1);
    });
}
