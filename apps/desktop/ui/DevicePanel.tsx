import type { Snapshot } from "../core/service";
import type { Binding, Profile } from "../core/profiles";
export function bindingLabel(b: Binding, profiles: Profile[]) {
  if (b.kind === "none") return "No action";
  if (b.kind === "cancel") return "Cancel run";
  return b.profileId
    ? (profiles.find((p) => p.id === b.profileId)?.name ?? "Missing workflow")
    : "Run selected";
}
export function DevicePanel({
  snapshot,
  action,
}: {
  snapshot: Snapshot;
  action: (command: string, value?: unknown) => Promise<boolean>;
}) {
  const profile = snapshot.profiles.find((p) => p.id === snapshot.selected)!;
  const virtual = snapshot.target === "virtual:signalkey";
  const unavailable = (b: Binding) =>
    !virtual ||
    !snapshot.connected ||
    snapshot.simulationPaused ||
    b.kind === "none" ||
    (b.kind === "run" && (snapshot.busy || !profile.enabled)) ||
    (b.kind === "cancel" && !snapshot.busy);
  return (
    <section className="device-panel" aria-label="Device simulator">
      <div className="panel-top">
        <span>{virtual ? "VIRTUAL DEVICE" : "USB DEVICE"}</span>
        <span>{snapshot.connected ? "CONNECTED" : "OFFLINE"}</span>
      </div>
      <div className={"device-stage state-" + snapshot.state}>
        <div className="cable" />
        <div className="device-body">
          <button
            className="physical-button"
            disabled={unavailable(profile.bindings.press)}
            aria-label="Simulate a single press to run the selected profile"
            onClick={() => void action("press", "press")}
          >
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M24 6v17M14 13a16 16 0 1 0 20 0" />
            </svg>
            <small>SIGNALKEY</small>
          </button>
        </div>
      </div>
      <div
        className={"state-text state-" + snapshot.state}
        role="status"
        aria-live="polite"
      >
        <span className="status-dot" />
        <strong>{snapshot.state}</strong>
        <span>
          {snapshot.simulationPaused
            ? "Host-loss simulation"
            : snapshot.busy
              ? "Real process active"
              : snapshot.state === "idle"
                ? "Ready when you are"
                : "Current companion state"}
        </span>
      </div>
      <div className="gesture-controls">
        {(["press", "double", "hold"] as const).map((g) => (
          <button
            key={g}
            disabled={unavailable(profile.bindings[g])}
            onClick={() => void action("press", g)}
          >
            {g === "press" ? "Press" : g === "double" ? "Double press" : "Hold"}
            <small>
              {bindingLabel(profile.bindings[g], snapshot.profiles)}
            </small>
          </button>
        ))}
      </div>
      <div className="device-details">
        <span>
          Device reports <b>{snapshot.deviceState}</b>
        </span>
        <span>
          {snapshot.capabilities
            ? `${snapshot.capabilities.ledCount} pixels · protocol 1.0`
            : "Capabilities unavailable"}
        </span>
      </div>
      <p className="sim-note">
        {virtual
          ? "No hardware needed. Workflow buttons execute real local commands."
          : "Device state is reported by firmware; it is not an optical measurement of the LEDs."}
      </p>
      {virtual ? (
        <details className="fault-controls">
          <summary>Test a connection failure</summary>
          <p className="help">
            Pause host messages to verify the six-second stale timeout, or
            simulate device removal.
          </p>
          <div className="button-row">
            <button
              disabled={!snapshot.connected || snapshot.simulationPaused}
              onClick={() => void action("simulate", "host-loss")}
            >
              Pause host link
            </button>
            <button
              disabled={!snapshot.connected}
              onClick={() => void action("simulate", "disconnect")}
            >
              Disconnect
            </button>
            <button
              disabled={snapshot.busy}
              onClick={() => void action("simulate", "restore")}
            >
              Restore
            </button>
          </div>
        </details>
      ) : null}
    </section>
  );
}
