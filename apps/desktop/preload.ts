import { contextBridge, ipcRenderer } from "electron";
const allowed = [
  "run",
  "create",
  "duplicate",
  "delete",
  "simulate",
  "light",
  "choose-executable",
  "choose-directory",
  "export-history",
  "snapshot",
  "devices",
  "press",
  "cancel",
  "save",
  "select",
  "connect",
  "import",
  "export",
  "login",
  "preferences",
  "quit",
];
contextBridge.exposeInMainWorld("signalkey", {
  invoke: (command: string, value?: unknown) => {
    if (!allowed.includes(command))
      return Promise.reject(new Error("Unsupported operation"));
    return ipcRenderer.invoke("signalkey", command, value);
  },
});
