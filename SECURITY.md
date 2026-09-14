# Security boundaries

Local commands run with the current user's permissions. SignalKey is not an execution sandbox. Only enable trusted executables/projects; an argument array prevents shell interpolation but cannot make a malicious executable safe. Explicit shells/interpreters can be configured after native review. Windows `.cmd` files need an explicitly configured interpreter; implicit shell fallback is intentionally absent.

Renderer Node integration is disabled, context isolation/sandbox enabled, external navigation/windows and permission requests denied, and CSP forbids remote content. Main validates sender and schemas. Import does not enable actions. Native confirmation is required for newly enabled or changed execution details. Do not store secrets in arguments, profile JSON or output: the visible log and exported profile can expose them. No telemetry or cloud upload is implemented.

The SDK token is session-scoped and stored locally; never share `sdk.json`. Its Windows security depends on the user's profile ACL. Same-user malicious software is outside this protection boundary. SDK cannot create or enable profiles. Origin requests are rejected and the server binds only to loopback. Application closure invalidates the listener; stale metadata can remain but no old session is reachable.

HID framing is bounded; devices are not authenticated cryptographically. A device impersonating an approved identity could issue a press, so physical HID beta needs explicit device enrollment/authorization UX beyond serial matching. Firmware never receives executable text. Device identity and firmware signing are not security attestations.

Report suspected vulnerabilities privately to the repository owner through an agreed channel; no public security email address has been invented. Preserve reproduction information while removing tokens, personal paths and confidential command output. No public release or production security audit has occurred.
