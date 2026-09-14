# Contributing

Use Node 24 and the pinned lockfile. Run `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:desktop` for UI/runtime changes. Tests run real harmless child processes and include intentionally failing sample commands; the suite itself must pass. Keep source changes scoped and update observed evidence separately from plans.

No credentials or personal profiles belong in the repository. Do not add telemetry, cloud requirements or implicit shell execution. Hardware changes require datasheets, revision tracking and explicit verified/unverified status. Do not submit guessed fabrication files. See `LICENSE-STATUS.md`: no open-source license grant has been made, so do not submit material requiring a contribution license until the owner publishes final terms.
