# INFINITE VOID

A chunky pixel-art idle space shooter that grows by itself: an AI agent ships **one small, progression-gated update plus a rebalance every day**, and each update auto-deploys once the tests pass.

**Play:** https://louisbrookhouse.github.io/infinite-void/

- Your ship fires on its own. Tap enemies for bonus damage and aim for glowing weak points on bosses.
- Spend credits on ship upgrades and guns. Every 5th wave is a boss. The run has no last wave.
- Warp Jump from wave 20 for Dark Matter, which buys permanent upgrades.
- Progress autosaves in your browser. SAVE/STATS > EXPORT gives a code you can load anywhere.
- Tap the version number (top left) to read the patch notes.

## Run locally

There is no build step. Open `index.html` directly, or serve it the way GitHub Pages does:

```sh
npm install          # Playwright, for tests only
npm run serve        # http://127.0.0.1:8080/infinite-void/
npm test             # docs validator + unit tests + headless browser suites
```

If Playwright's bundled Chromium isn't installed, point the browser tests at a local Chrome with `CHROME_PATH=/usr/bin/google-chrome npm test`.

## For contributors and agents

Start with [AGENTS.md](AGENTS.md), then [docs/INDEX.md](docs/INDEX.md).
