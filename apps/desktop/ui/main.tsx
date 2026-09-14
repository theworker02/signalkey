import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { Snapshot } from "../core/service";
import { ProfileEditor } from "./ProfileEditor";
import { DevicePanel } from "./DevicePanel";
import { RunActivity } from "./RunActivity";
import "./style.css";
declare global {
  interface Window {
    signalkey: {
      invoke: (command: string, value?: unknown) => Promise<unknown>;
    };
  }
}
const invoke = window.signalkey.invoke;
function App() {
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [devices, setDevices] = useState<{ id: string; name: string }[]>([]);
  const [login, setLogin] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const onDirty = useCallback((value: boolean) => setDirty(value), []);
  const action = useCallback(async (command: string, value?: unknown) => {
    setPending(true);
    try {
      setError("");
      setNotice("");
      await invoke(command, value);
      setSnapshot((await invoke("snapshot")) as Snapshot);
      if (command === "save") setNotice("Workflow saved.");
      return true;
    } catch (e) {
      setError(
        String(e).replace(
          /^Error: Error invoking remote method 'signalkey': Error: /,
          "",
        ),
      );
      return false;
    } finally {
      setPending(false);
    }
  }, []);
  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const result = await invoke("snapshot");
        if (mounted) setSnapshot(result as Snapshot);
      } catch (e) {
        if (mounted) setError(String(e));
      } finally {
        if (mounted) timer = setTimeout(poll, 250);
      }
    }
    void poll();
    void invoke("devices")
      .then((v) => {
        if (mounted) setDevices(v as typeof devices);
      })
      .catch((e) => setError(String(e)));
    void invoke("preferences")
      .then((v) => setLogin((v as { login: boolean }).login))
      .catch((e) => setError(String(e)));
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);
  async function change(command: string, value?: unknown) {
    if (dirty && !window.confirm("Discard unsaved workflow changes?")) return;
    await action(command, value);
  }
  if (!snapshot)
    return (
      <main className="loading">
        <div className="brand">◉ SignalKey</div>
        <p role="status">Starting your local workspace…</p>
        {error ? <p role="alert">{error}</p> : null}
      </main>
    );
  const profile = snapshot.profiles.find((p) => p.id === snapshot.selected);
  if (!profile)
    return (
      <main role="alert">
        No selected workflow is available. Restart SignalKey to recover
        configuration.
      </main>
    );
  const filtered = snapshot.profiles.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <header>
        <div className="brand">
          <span className="brand-icon">◉</span>
          <b>SignalKey</b>
          <span className="by">MAGNEXIS</span>
        </div>
        <div className="header-actions">
          <span className="connection">
            {snapshot.connected
              ? "● Device connected"
              : "○ Device disconnected"}
          </span>
          <span className="version">0.1.0-alpha.2</span>
          <button onClick={() => void action("quit")}>Quit</button>
        </div>
      </header>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-title">
            <h2>Workflows</h2>
            <button
              title="Create workflow"
              aria-label="Create workflow"
              disabled={snapshot.busy}
              onClick={() => void change("create")}
            >
              +
            </button>
          </div>
          <input
            type="search"
            aria-label="Search workflows"
            placeholder="Find a workflow…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <nav aria-label="Workflows">
            {filtered.map((p) => (
              <button
                key={p.id}
                className={p.id === profile.id ? "workflow active" : "workflow"}
                aria-current={p.id === profile.id ? "page" : undefined}
                disabled={snapshot.busy}
                onClick={() => void change("select", p.id)}
              >
                <span className="workflow-symbol">⌘</span>
                <span>
                  <b>{p.name}</b>
                  <small>
                    {p.enabled ? "Ready to run" : "Review before enabling"}
                  </small>
                </span>
              </button>
            ))}
            {!filtered.length ? (
              <p className="help">No matching workflows.</p>
            ) : null}
          </nav>
          <div className="sidebar-tools">
            <button
              onClick={() => void change("duplicate")}
              disabled={snapshot.busy}
            >
              Duplicate selected
            </button>
            <button
              onClick={() => void change("import")}
              disabled={snapshot.busy}
            >
              Import profile
            </button>
            <button onClick={() => void action("export")}>
              Export profile
            </button>
            <button
              className="danger-text"
              onClick={() => void change("delete", profile.id)}
              disabled={snapshot.busy || snapshot.profiles.length < 2}
            >
              Delete selected
            </button>
          </div>
          <div className="local-note">
            <b>Yours, locally.</b>
            <p>
              Commands and history stay on this computer. No sign-in. No
              telemetry.
            </p>
          </div>
        </aside>
        <main>
          <div className="heading">
            <div>
              <p className="eyebrow">WORKFLOW STUDIO</p>
              <h1>One press. A real result.</h1>
              <p className="muted">
                A quiet place to configure, run, and understand your work.
              </p>
            </div>
            <label className="device-select">
              Active device
              <select
                value={snapshot.target}
                disabled={snapshot.busy}
                onChange={(e) => void action("connect", e.target.value)}
              >
                {!devices.some((d) => d.id === snapshot.target) ? (
                  <option value={snapshot.target}>
                    {snapshot.target} · unavailable
                  </option>
                ) : null}
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <button
                className="text-button"
                onClick={() =>
                  void invoke("devices")
                    .then((v) => setDevices(v as typeof devices))
                    .catch((e) => setError(String(e)))
                }
              >
                Refresh devices
              </button>
            </label>
          </div>
          {error ? (
            <div className="error" role="alert">
              <span>{error}</span>
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                ×
              </button>
            </div>
          ) : null}
          {notice ? (
            <div className="notice" role="status">
              {notice}
            </div>
          ) : null}
          <div className="run-toolbar">
            <div>
              <b>{profile.name}</b>
              <span>
                {dirty
                  ? "Runs use the last saved configuration."
                  : profile.enabled
                    ? "Enabled · one process at a time"
                    : "Disabled · review and enable in settings"}
              </span>
            </div>
            <button
              className="primary run-button"
              disabled={snapshot.busy || !profile.enabled || dirty}
              onClick={() => void action("run", profile.id)}
            >
              {snapshot.busy ? "Running…" : "▶ Run workflow"}
            </button>
          </div>
          <div className="workspace">
            <DevicePanel snapshot={snapshot} action={action} />
            <ProfileEditor
              key={JSON.stringify(profile)}
              profile={profile}
              profiles={snapshot.profiles}
              busy={snapshot.busy || pending}
              action={action}
              invoke={invoke}
              onDirty={onDirty}
              onError={setError}
            />
          </div>
          <RunActivity snapshot={snapshot} action={action} />
          <footer>
            <label className="check">
              <input
                type="checkbox"
                checked={login}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  void invoke("login", enabled)
                    .then((v) => setLogin(Boolean(v)))
                    .catch((e) => setError(String(e)));
                }}
              />
              Launch at login
            </label>
            <span>
              Closing the window keeps SignalKey in the tray. Quit exits
              completely.
            </span>
          </footer>
        </main>
      </div>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
