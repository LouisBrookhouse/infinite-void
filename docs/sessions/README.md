# Session notes (ephemeral, 7-day expiry)

Every PR that changes the repo must add or update one note here (CI enforces this). Notes are short-lived working memory for the next agent session. They are **not** the source of truth. Anything that must outlive the note goes into [../STATUS.md](../STATUS.md), [../ROADMAP.md](../ROADMAP.md) or [../DESIGN.md](../DESIGN.md) **before** you set `durable_promoted: true`.

## Rules
- File name: `YYYY-MM-DD-short-slug.md`, where the date equals the `created` date (UTC).
- Front-matter (validated by `scripts/validate-docs.js`):
  - `created`: UTC ISO timestamp, e.g. `2026-11-17T10:30:00Z`. Set it once and never change it.
  - `updated`: optional UTC ISO timestamp, >= `created`.
  - `intent`: one line.
  - `durable_promoted`: `true` once lasting knowledge has been promoted, otherwise `false`.
- Sections: Intent, Scope, Changes, Validation, Open items, Next steps, Links.
- No credentials, tokens, private transcripts or personal data. Link to PRs and commits instead of pasting logs.
- Expiry: `scripts/expire-sessions.js` (daily workflow) deletes notes more than 7 days past `created`, but only if `durable_promoted: true`. See [../OPERATIONS.md](../OPERATIONS.md).

Copy [TEMPLATE.md](TEMPLATE.md) to start.
