import { useState } from "react";
import type { Snapshot } from "../core/service";
const duration = (ms: number) =>
  ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`;
export function RunActivity({
  snapshot,
  action,
}: {
  snapshot: Snapshot;
  action: (command: string, value?: unknown) => Promise<boolean>;
}) {
  const [tab, setTab] = useState<"output" | "history">("output");
  return (
    <section className="activity">
      <div className="section-title">
        <div className="tabs" role="tablist" aria-label="Activity views">
          <button
            role="tab"
            aria-selected={tab === "output"}
            onClick={() => setTab("output")}
          >
            Output
          </button>
          <button
            role="tab"
            aria-selected={tab === "history"}
            onClick={() => setTab("history")}
          >
            Run history <span>{snapshot.history.length}</span>
          </button>
        </div>
        <div className="button-row">
          {tab === "history" ? (
            <button
              disabled={!snapshot.history.length}
              onClick={() => void action("export-history")}
            >
              Export history
            </button>
          ) : null}
          <button
            disabled={!snapshot.busy}
            onClick={() => void action("cancel")}
          >
            Cancel process tree
          </button>
        </div>
      </div>
      {tab === "output" ? (
        <>
          <div className="run-meta">
            <span>
              {snapshot.activeProfile ??
                snapshot.history[0]?.profileName ??
                "No command started"}
            </span>
            <span>
              {snapshot.busy
                ? "Running…"
                : snapshot.startedAt
                  ? duration(snapshot.durationMs)
                  : "—"}
              {snapshot.exitCode !== null ? ` · exit ${snapshot.exitCode}` : ""}
            </span>
          </div>
          <pre aria-label="Command output">
            {snapshot.output ||
              "Your next result starts here. Press the button or run a workflow."}
          </pre>
          {snapshot.truncated ? (
            <p className="help">Output is limited to the most recent 32 KiB.</p>
          ) : null}
          {snapshot.launchMs !== null ? (
            <p className="help">
              Last local process launch: {duration(snapshot.launchMs)} from
              runner entry to the process spawn event. This excludes USB,
              physical gestures and LED response.
            </p>
          ) : null}
        </>
      ) : (
        <div className="history-scroll">
          {snapshot.history.length ? (
            <table>
              <thead>
                <tr>
                  <th>Workflow / time</th>
                  <th>Result</th>
                  <th>Duration</th>
                  <th>Source</th>
                  <th>Exit</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.history.map((run) => (
                  <tr key={run.id}>
                    <td>
                      <b>{run.profileName}</b>
                      <small>{new Date(run.startedAt).toLocaleString()}</small>
                    </td>
                    <td className={"result state-" + run.state}>
                      <span className="status-dot" />
                      {run.state}
                    </td>
                    <td>{duration(run.durationMs)}</td>
                    <td>{run.source}</td>
                    <td>{run.exitCode ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty">
              <h3>No runs yet</h3>
              <p>
                Completed runs appear here. Only metadata is saved; command
                output stays in memory.
              </p>
            </div>
          )}
        </div>
      )}
      {snapshot.errors.length ? (
        <details className="diagnostics">
          <summary>Diagnostics · {snapshot.errors.length}</summary>
          <pre>{snapshot.errors.join("\n")}</pre>
        </details>
      ) : null}
    </section>
  );
}
