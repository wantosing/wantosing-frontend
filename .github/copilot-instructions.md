## Quick context

This repository is a Next.js (App Router) frontend adapted to run on Cloudflare Workers using OpenNext.js.
Key technologies: Next 15 (app/), TypeScript, Tailwind + DaisyUI, OpenNext Cloudflare adapter, Wrangler config.

## Architecture & why

- The app source lives under `app/` (Next.js App Router). Root layout: `app/layout.tsx`, main page: `app/page.tsx`.
- OpenNext builds a Cloudflare Worker from the Next app and emits runtime artifacts under `.open-next/` (worker + static assets). Wrangler (`wrangler.jsonc`) config points `main` at `.open-next/worker.js`.
- Cloudflare runtime types are generated into `cloudflare-env.d.ts` and referenced in `tsconfig.json` via `types` so Worker bindings (e.g. `ASSETS`) are strongly typed.
- `patches/` contains `patch-package` patches (see `postinstall` in `package.json`) — these are applied automatically on local installs (except in CI/production). Do not remove without checking why the patch exists.

## Important files to read first

- `package.json` — scripts: `dev`, `build`, `start`, `lint`, `deploy`, `preview`, `cf-typegen`.
- `wrangler.jsonc` — Cloudflare Worker bindings, `main` entry, compatibility flags.
- `cloudflare-env.d.ts` — auto-generated CF types (run `npm run cf-typegen` to regenerate).
- `.open-next/` (generated) — contains the built worker; inspect when debugging worker runtime issues.
- `patches/` — patch-package patches applied by `postinstall`.


## Developer workflows (concrete commands)

- Local Next dev (with OpenNext dev support):
  npm run dev

- Local development (fast iteration):
  npm run dev

- Test production worker build (PRIMARY - recommended):
  npm run preview
  # Builds `.open-next/` and runs a local Cloudflare preview; use this to validate runtime behavior locally.

- Build for production / CI (artifact generation):
  npm run build
  # Use in CI or when you need the static/server build outputs without starting the preview server.

- Deploy to Cloudflare using OpenNext wrapper + Wrangler:
  npm run deploy
  (runs `opennextjs-cloudflare build && opennextjs-cloudflare deploy`)

- Regenerate Cloudflare TypeScript bindings (when Wrangler environment changes):
  npm run cf-typegen

- Linting: `npm run lint` (uses `next lint`). There are no test scripts in package.json.

Note: before `deploy`, ensure `wrangler login` and that your Cloudflare account/context is set up — Wrangler is a prerequisite for deploy steps.

## Project-specific conventions & patterns

- App Router usage: components and pages use `app/` (not `pages/`). Prefer server components by default; use client components only when necessary (add `'use client'`).
- Cloudflare bindings and runtime types: rely on `cloudflare-env.d.ts` for shapes. If you add new bindings (KV, R2, Secrets), run `npm run cf-typegen` and update `wrangler.jsonc`.
- Generated worker: do not hand-edit `.open-next/worker.js`. Fix at source (Next app) and rebuild with OpenNext.
- Patch-package: local `npm install` runs `patch-package` automatically (unless NODE_ENV=production or CI=true). Keep `patches/` in source control.

## Integration points & external deps

- OpenNext Cloudflare adapter: `@opennextjs/cloudflare` — used for building/deploying Next into Cloudflare Worker.
- Wrangler (`wrangler`) — Cloudflare CLI; configuration: `wrangler.jsonc`.
- Tailwind + DaisyUI — styling (see `postcss.config.mjs` and `globals.css`).

## Debugging tips

- To reproduce runtime behavior for worker-specific issues, run `npm run preview` (build + preview) and inspect `.open-next/` and Wrangler output.
- For type issues with Cloudflare bindings, regenerate types with `npm run cf-typegen` and restart your TypeScript server / IDE.
- When adding or updating dependencies that OpenNext patches, check `patches/` — if a dependency upgrade breaks a patch, update or remove the patch and test the build.

## Examples / patterns to copy

- Fonts & layout: `app/layout.tsx` uses `next/font/google` and global CSS via `./globals.css`.
- Navbar example: `app/page.tsx` demonstrates Tailwind + DaisyUI usage and component structure for pages.

## Quick checklist for edits that touch infra

1. Add CF binding -> update `wrangler.jsonc` and run `npm run cf-typegen`.
2. Change runtime behavior -> run `npm run preview` to validate `.open-next/` output locally. Use `npm run build` in CI or when you need artifact files only.
3. Change dependencies -> run `npm install` locally to ensure `patch-package` runs and tests the build.

## Where to look next

- `package.json`, `wrangler.jsonc`, `cloudflare-env.d.ts`, `app/layout.tsx`, `app/page.tsx`, and `patches/`

If any section above is unclear or you'd like me to include examples of common change tasks (adding a binding, updating a patch, or the exact deploy workflow with Wrangler login steps), tell me which area to expand.

## Try it — concrete CLI examples (Windows cmd)

Run the dev server with OpenNext-enabled Next dev:

```cmd
npm run dev
```

Build and preview the worker (builds `.open-next/` then runs a local preview):

```cmd
npm run preview
```

Build for production:

```cmd
npm run build
```

Deploy to Cloudflare (requires `wrangler login` first):

```cmd
wrangler login
npm run deploy
```

Regenerate Cloudflare runtime types when you change `wrangler.jsonc` bindings:

```cmd
npm run cf-typegen
```


## Troubleshooting (step-by-step sessions)

Below are minimal, reproducible debug sessions for the most common failures. Use the exact commands in a Windows `cmd.exe` terminal and copy the outputs when asking for help.

1) Worker build failing / runtime errors in preview

- Reproduce the error by running the preview (this builds then runs a local preview of the Cloudflare worker):

```cmd
npm run preview
```

- Look for stack traces or error lines in the terminal. If you see a runtime message referencing a missing binding (for example "ASSETS is not defined" or "binding X not found"), do the following:

```cmd

  :: Inspect the generated worker file for obvious failures
  type .open-next\worker.js | more

  :: Check wrangler config
  type wrangler.jsonc

  :: Regenerate TS bindings for Cloudflare env and preview the production worker
  npm run cf-typegen
  npm run preview
```

- What to inspect: the terminal stack trace, the top 200 lines of `.open-next\worker.js`, and `wrangler.jsonc` bindings. Copy those into an issue or message when requesting help.

2) Static assets missing in the worker runtime


- Build and inspect the generated assets directory (preview builds the worker and assets):

```cmd
npm run preview
dir .open-next\assets /b /s
```

- Confirm `wrangler.jsonc` points to the same assets binding (`ASSETS` by default):

```cmd
type wrangler.jsonc
```


- If assets are present in `public/` but not in `.open-next/assets`, delete `.open-next/` and re-run preview to force regeneration:

```cmd
rmdir /s /q .open-next
npm run preview
```

3) Type errors for Cloudflare bindings in the IDE

- If TypeScript complains about missing Cloudflare bindings or the shapes are outdated:

```cmd
npm run cf-typegen
```

- Then restart the TypeScript server in your editor (VS Code: Command Palette -> "TypeScript: Restart TS Server") or reload the window. Verify `cloudflare-env.d.ts` was updated (file is large; check modification timestamp).

4) `patch-package` didn't apply / local discrepancies after `npm install`

- The repo runs `patch-package` from `postinstall` locally. To reproduce and observe the patch application:

```cmd
npm install

:: To apply patches manually if needed
npx patch-package
```

- If things still look wrong, inspect which package the patch targets by listing `patches/` and open the relevant `.patch` file — the filename encodes the package and version (e.g. `@opennextjs+cloudflare+1.9.1.patch`).

5) Dependency upgrades break OpenNext patches

- If a dependency update causes patch failures during `npm install`, do one of the following:

  - Revert the dependency update to the previous version that matches the patch filename.
  - Update the patch: open `patches/<file>.patch`, adjust the hunks to the new dependency's diff, then run `npx patch-package <package-name>` to re-generate.


- Quick checks:

```cmd
dir patches
type patches\@opennextjs+cloudflare+1.9.1.patch
npm install
npm run preview
```

6) What to include when asking for help

- Minimal helpful pastebin/issue contents:
  - The exact command you ran and full terminal output (or the last 100-300 lines).
  - Top 200 lines of `.open-next\worker.js` when the worker build fails.
  - `wrangler.jsonc` contents.
  - `package.json` (scripts and dependencies), and the relevant file inside `patches/`.

Collecting those makes triage much faster.
