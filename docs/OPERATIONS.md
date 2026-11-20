# Operations: CI, deploy, auto-merge, expiry, rollback

## Workflows (`.github/workflows/`)
| Workflow | Trigger | Permissions | What it does |
|---|---|---|---|
| `ci.yml`, job **test** | PR to `main` (opened/sync/reopen/labelled/unlabelled), push to `main`, manual | `contents: read` | `npm ci`, installs Playwright Chromium, `validate-docs.js` (with `--base` and `DAILY_UPDATE` on PRs), `tests/unit.js`, `tests/run.js`. Uploads `artifacts/` (screenshots, balance report) |
| `ci.yml`, job **deploy** | after **test** succeeds, only on `main` (push or manual dispatch) | `pages: write`, `id-token: write` | Copies `index.html`, `css/`, `src/`, `assets/` to `_site`, then upload-pages-artifact, deploy-pages, and a live check that the deployed changelog has the new version |
| `automerge.yml` | `workflow_run` of CI completed | `contents: write`, `pull-requests: write`, `actions: write` | Squash-merges the open, same-repo PR labelled `daily-update` whose head SHA is the one that just passed, after re-checking protected paths. Then deletes the `daily/*` branch and dispatches `ci.yml` on `main` (a merge made with `GITHUB_TOKEN` triggers neither push workflows nor delete-branch-on-merge) |
| `expire-sessions.yml` | daily 03:23 UTC, manual (dry-run option) | `contents: write` | Runs `scripts/expire-sessions.js --apply`, verifies only deletions inside `docs/sessions/`, commits and pushes to `main` |

## Auto-merge security model
- PR code only ever runs in `ci.yml` under the `pull_request` event with a read-only token and no secrets. `pull_request_target` is never used.
- `automerge.yml` checks out nothing and executes no PR code. It only calls the GitHub API with `gh` and filters out PRs from forks (`isCrossRepository`) or with a head SHA that differs from the tested one (`--match-head-commit`).
- Daily PRs can't change CI, tests, guardrails or agent rules. Both the validator (in CI) and `automerge.yml` (at merge time) refuse them.
- There's no branch protection on `main` (see STATUS.md). Auto-merge doesn't need it, because it merges only after a successful CI run for that exact commit.

## Deploy
- Pages source: GitHub Actions (`build_type=workflow`). The site is static, there's no build, and `.nojekyll` is written into the artifact.
- Manual redeploy: Actions > CI > Run workflow on `main`, or `gh workflow run ci.yml --ref main`.
- The live check polls the deployed `src/content/changelog.js` for the expected version, retrying for up to ~5 minutes because of the Pages CDN.

## Rollback
1. `git revert <bad squash commit>` on a branch, then open a PR **without** `daily-update`, with a session note and a changelog `fixed` entry (patch bump). Merge it once CI passes, or ask the owner.
2. Emergency: re-run the **deploy** job of an older successful CI run on `main` (Actions UI > that run > Re-run jobs). This redeploys that commit's site without changing git.
3. Never force-push `main`.

## Session-note expiry
- Notes live in `docs/sessions/YYYY-MM-DD-slug.md` with front-matter `created` (UTC ISO), and they expire 7 days after `created`. File mtime and later edits don't extend a note's life.
- A note gets deleted only if `durable_promoted: true`, so its lasting content has to go into STATUS, ROADMAP or DESIGN first. Unpromoted expired notes are kept and reported.
- Malformed or future timestamps, symlinks, non-matching names, `README.md` and `TEMPLATE.md` are never deleted. Expiry happens up to ~24 hours after a note turns 7 days old (daily cron). Deletion removes the note from the tree, not from git history.
- Dry run: `node scripts/expire-sessions.js` (add `--now 2026-12-01T00:00:00Z` to simulate a date).

## Art on a daily update
Every sprite, boss part, mine, drone, pod, and projectile added or redrawn in a daily update follows the Art style guide in [DESIGN.md](DESIGN.md). Screenshot it next to the v1.0 scout, fighter, cruiser, and the player ship, and do not ship it if it looks like a different hand. AGENTS.md stays owner-edited. This section is the pointer daily updates use.

## Local commands
See the table in [../AGENTS.md](../AGENTS.md).
