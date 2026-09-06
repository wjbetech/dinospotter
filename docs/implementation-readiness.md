# Implementation readiness

Status: review required before feature implementation. This document records the
preflight gaps found on 2026-09-06. The roadmap is the execution plan; this file
is the go/no-go gate and the source of truth for unresolved infrastructure.

## Current baseline

- The repository is still the Vite+ starter. `apps/website/src/main.ts` and
  `packages/utils/src/index.ts` are not DinoSpotter implementations.
- `vp check` currently reports Markdown formatting failures in the roadmap and
  ADR-002 through ADR-004. Format the docs before using `vp check` as a gate.
- `vp run -r test` currently runs only the starter utility test. It does not
  prove the planned browser, proxy, contract, or performance tests.
- `vp run -r build` currently fails in `packages/utils` because `tsgo: true`
  requires the missing `@typescript/native-preview` package. T0.0 must either
  install the compatible package or remove the experimental tsgo setting, then
  record the choice.
- There is no `api/`, `vercel.json`, `.github/workflows/`, browser-test config,
  Lighthouse configuration, country GeoJSON, seed payload, or sprite directory.
  All references to these are planned artifacts, not existing infrastructure.

## T0.0 go/no-go gate

Do this before T0.1 and before asking the mentor to build a feature:

1. Run `vp install` and make `vp check`, `vp run -r test`, and
   `vp run -r build` green on the unmodified starter. A toolchain failure is
   not a feature ticket failure.
2. Decide whether `packages/utils` is consumed as a workspace package or by a
   source alias. Prefer a workspace dependency and its public package export;
   never make application code deep-import another package's `src` directory.
   Make the build/test task order explicit.
3. Choose the local full-stack development path. The production API is under
   Vercel's root `api/` directory; `vp dev` alone does not execute those
   functions. Recommended: document a `vercel dev` path or provide an
   equivalent local adapter and test it before T1.2b.
4. Add a typed API check covering `api/` and document the Vercel project root,
   build command, output directory, Node runtime, and preview environment.

Completion criterion: a clean starter can be installed, checked, tested, and
built using documented commands, and the mentor can run the same commands.

## Decisions that remain open

| ID  | Decision required                            | Why it blocks                                                                                            | Recommended default                                                                                                   |
| --- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| D4  | Production MapLibre style and basemap source | A renderer and country polygons do not provide a complete map style.                                     | Self-host a minimal light style and approved public geography data; document attribution and license.                 |
| D5  | Local execution of `/api/*`                  | The frontend's `/api` calls cannot reach root Vercel functions through the current `vp run dev` script.  | Use `vercel dev` for full-stack work, with a separate frontend-only mode if useful.                                   |
| D6  | Proxy stale-data mechanism                   | CDN `stale-while-revalidate` can serve an old response but cannot by itself set a payload `stale` field. | Let the client own session/seed fallback; reserve `stale=true` for a proxy cache that can actually return stale data. |
| D7  | Browser test runner and CI environment       | Vitest, axe, Lighthouse, and F1-F7 need different runners and a running app.                             | Use a pinned browser runner for E2E, Vitest for pure logic, and Lighthouse CI against a preview build.                |

No feature ticket may silently decide D4-D7. Close each decision in this file
or an ADR, then update the affected ticket's blocker list.

## Test matrix

| Concern                   | Runner                                      | Fixture/target                                         | Gate                                                                     |
| ------------------------- | ------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------ |
| Pure data and state logic | Vitest in `packages/utils` and website      | Literal PBDB fixtures, including malformed rows        | `vp test`                                                                |
| Proxy contract            | Vitest with mocked `fetch`                  | 200, empty, malformed, timeout, 429, and 5xx responses | `vp test`                                                                |
| Pick and leader geometry  | Vitest benchmark plus unit tests            | Bundled polygon fixture and deterministic site set     | benchmark is reported; correctness tests fail on regression              |
| DOM accessibility         | Browser runner plus axe                     | Empty, loading, error, card, and modal states          | zero axe violations and keyboard path                                    |
| Golden paths              | Pinned browser runner                       | Local full-stack server and deterministic API stub     | F1-F7 pass without live PBDB dependency                                  |
| Performance               | Lighthouse CI and build artifact inspection | Preview build, US/Mesozoic fixture                     | LCP <2.5s, INP <200ms, initial JS <250 KB gzip, globe chunk <150 KB gzip |

F1-F7 must use a deterministic API fixture or service worker. Live PBDB is an
integration smoke check, not the only E2E test, because availability and data
change are outside CI's control.

## Handoff rule

The mentor may start only at the current frontier in `roadmap.md`. A ticket is
ready when its blockers are closed, its files are marked planned, its acceptance
criteria name a runnable check, and its contract tests use fixed expected
values. “Decision locked” means the design is chosen; it does not mean the
implementation or verification exists.
