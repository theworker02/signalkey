import { useEffect, useState } from "react";
import type { Profile, Binding } from "../core/profiles";
type Props = {
  profile: Profile;
  profiles: Profile[];
  busy: boolean;
  action: (command: string, value?: unknown) => Promise<boolean>;
  invoke: (command: string, value?: unknown) => Promise<unknown>;
  onDirty: (dirty: boolean) => void;
  onError: (error: string) => void;
};
const bindingValue = (b: Binding) =>
  b.kind === "run" ? (b.profileId ?? "self") : b.kind;
export function ProfileEditor({
  profile,
  profiles,
  busy,
  action,
  invoke,
  onDirty,
  onError,
}: Props) {
  const [draft, setDraft] = useState(profile);
  const [args, setArgs] = useState(JSON.stringify(profile.args, null, 2));
  const [tab, setTab] = useState<"command" | "gestures" | "light">("command");
  const signature = JSON.stringify(profile);
  const dirty =
    JSON.stringify(draft) !== signature ||
    args !== JSON.stringify(profile.args, null, 2);
  useEffect(() => onDirty(dirty), [dirty, onDirty]);
  async function choose(command: string, key: "cwd" | "executable") {
    try {
      const result = await invoke(command);
      if (typeof result === "string")
        setDraft((p) => ({ ...p, [key]: result }));
    } catch (e) {
      onError(String(e));
    }
  }
  return (
    <section className="editor" aria-label="Workflow editor">
      <div className="section-title">
        <div>
          <p className="eyebrow">CONFIGURATION</p>
          <h2>{profile.name}</h2>
        </div>
        <span className={dirty ? "unsaved" : "subtle"}>
          {dirty ? "Unsaved changes" : profile.enabled ? "Enabled" : "Disabled"}
        </span>
      </div>
      <div className="tabs" role="tablist" aria-label="Workflow settings">
        {(["command", "gestures", "light"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
          >
            {t === "command"
              ? "Command"
              : t === "gestures"
                ? "Gestures"
                : "Light & feedback"}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            const parsed: unknown = JSON.parse(args);
            void action("save", { ...draft, args: parsed });
          } catch {
            onError("Arguments must be a JSON array of strings.");
          }
        }}
      >
        <fieldset disabled={busy}>
          {tab === "command" ? (
            <>
              <label>
                Workflow name
                <input
                  maxLength={80}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>
              <label>
                Executable
                <div className="input-action">
                  <input
                    spellCheck={false}
                    value={draft.executable}
                    onChange={(e) =>
                      setDraft({ ...draft, executable: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      void choose("choose-executable", "executable")
                    }
                  >
                    Browse
                  </button>
                </div>
              </label>
              <label>
                Arguments{" "}
                <span className="subtle">
                  JSON array, one argument per string
                </span>
                <textarea
                  spellCheck={false}
                  rows={4}
                  value={args}
                  onChange={(e) => setArgs(e.target.value)}
                />
              </label>
              <label>
                Working directory
                <div className="input-action">
                  <input
                    spellCheck={false}
                    value={draft.cwd}
                    onChange={(e) =>
                      setDraft({ ...draft, cwd: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => void choose("choose-directory", "cwd")}
                  >
                    Browse
                  </button>
                </div>
              </label>
              <label>
                Timeout in seconds
                <input
                  className="short-input"
                  type="number"
                  min="0.1"
                  step="0.1"
                  max="3600"
                  value={draft.timeoutMs / 1000}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      timeoutMs: Number(e.target.value) * 1000,
                    })
                  }
                />
              </label>
            </>
          ) : null}
          {tab === "gestures" ? (
            <div className="gesture-settings">
              <p className="help">
                Choose what each physical or simulated gesture does. Commands
                run only when their workflows are enabled.
              </p>
              {(["press", "double", "hold"] as const).map((g) => (
                <label key={g}>
                  {g === "press"
                    ? "Single press"
                    : g === "double"
                      ? "Double press"
                      : "Hold"}
                  <select
                    aria-label={
                      g === "press"
                        ? "Single press"
                        : g === "double"
                          ? "Double press"
                          : "Hold"
                    }
                    value={bindingValue(draft.bindings[g])}
                    onChange={(e) => {
                      const v = e.target.value;
                      const binding: Binding =
                        v === "none"
                          ? { kind: "none" }
                          : v === "cancel"
                            ? { kind: "cancel" }
                            : {
                                kind: "run",
                                ...(v === "self" ? {} : { profileId: v }),
                              };
                      setDraft({
                        ...draft,
                        bindings: { ...draft.bindings, [g]: binding },
                      });
                    }}
                  >
                    <option value="self">Run this workflow</option>
                    <option value="none">Do nothing</option>
                    <option value="cancel">Cancel the active run</option>
                    {profiles
                      .filter((p) => p.id !== profile.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          Run {p.name}
                          {p.enabled ? "" : " (disabled)"}
                        </option>
                      ))}
                  </select>
                </label>
              ))}
              <aside className="callout">
                Physical firmware uses a 300 ms double-press window and an 800
                ms hold threshold. Simulator controls dispatch the chosen
                gesture immediately.
              </aside>
            </div>
          ) : null}
          {tab === "light" ? (
            <>
              <label>
                Brightness · {Math.round((draft.brightness / 64) * 100)}% of the
                firmware ceiling
                <input
                  type="range"
                  min="0"
                  max="64"
                  value={draft.brightness}
                  onChange={(e) =>
                    setDraft({ ...draft, brightness: Number(e.target.value) })
                  }
                />
              </label>
              <p className="help">
                100% here means channel value 64/255. This software ceiling does
                not replace electrical current limiting.
              </p>
              <div className="legend">
                {[
                  ["idle", "Dim white", "Ready"],
                  ["running", "Blue pulse", "Process active"],
                  ["success", "Green", "Exit code 0"],
                  [
                    "failure",
                    "Red double pulse",
                    "Nonzero exit / launch failure",
                  ],
                  ["cancelled", "Amber", "Cancelled by you"],
                  ["unknown", "Dim amber pattern", "No fresh status"],
                ].map(([state, color, description]) => (
                  <div key={state} className={"state-" + state}>
                    <i />
                    <span>
                      <b>{color}</b>
                      <small>{description}</small>
                    </span>
                  </div>
                ))}
              </div>
              <p className="help">
                Patterns and colors currently follow protocol defaults. Text
                labels always accompany color in the app.
              </p>
            </>
          ) : null}
          <label className="check enable">
            <input
              type="checkbox"
              checked={draft.enabled}
              onChange={(e) =>
                setDraft({ ...draft, enabled: e.target.checked })
              }
            />
            Enable this reviewed workflow
          </label>
        </fieldset>
        <div className="editor-footer">
          <span className="subtle">
            {dirty
              ? "Save before running these changes."
              : "Local settings · no account required"}
          </span>
          <button className="primary" disabled={busy || !dirty} type="submit">
            Save workflow
          </button>
        </div>
      </form>
    </section>
  );
}
