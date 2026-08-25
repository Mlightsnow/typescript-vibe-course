# TypeScript for the Vibe Coding Era

[中文说明](README.zh-CN.md)

A Chinese-and-English interactive course that starts from JavaScript runtime fundamentals and builds toward AI code review and reliable Node.js backends. The website opens in **English by default**; use the language control in the header to switch to Chinese. A separate control switches between light and dark themes.

This is not a syntax dictionary. One evolving project—**CodePilot**—teaches learners to:

- review and repair AI-generated TypeScript;
- understand and modify an existing React application;
- build, test, and run a Node.js backend locally.

## Current release

Phase one includes the 75-minute zero-background P00 preparation and M00–M02. P00 does not renumber the existing modules or break their URLs.

- Four complete lessons in English and Chinese;
- three progressive P00 Playgrounds plus the existing lesson labs;
- Monaco TypeScript diagnostics and isolated Web Worker execution;
- browser-local progress, drafts, search, and code copying;
- a cancellable mock CodePilot streaming CLI;
- automated checks for references, terminal events, cancellation silence, and timer cleanup.

This release reads no API keys, installs no model SDK, and sends no model requests.

## Requirements

- Node.js 22.13+ (Node.js 24 LTS recommended)
- npm 10+

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal. Lessons and browser labs require no external service.

## Common commands

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run verify:lesson -- P00
npm run verify:lesson -- M02
npm run codepilot -- "review this task queue"
npx next build
```

Press `Ctrl+C` once to request graceful cancellation from CodePilot; press it twice to exit immediately.

## Learning path

| Phase | Lessons | Outcome |
|---|---|---|
| 00 Zero-background preparation | P00 (75 min) | Read values, objects, functions, diagnostics, `unknown`, and type erasure |
| 01 Runtime foundations | M00–M02 | Evidence, references, modules, Promise, streams, and cancellation |
| 02 Type system | M03–M05 | Unions, narrowing, generics, boundary validation, and build responsibilities |
| 03 Plain Node backend | M06–M07 | REST, SSE, error protocols, and behavior tests |
| 04 Enterprise backend | M08–M12 | NestJS, SQLite → PostgreSQL, agents, queues, and observability |
| 05 React and delivery | M13–M14 | Modify React and deliver a cross-layer feature safely |

See [the course blueprint](docs/course-blueprint.md) and [current architecture](docs/architecture.md).

## Repository layout

```text
app/                         App Router pages and global styles
components/                  Navigation, preferences, search, progress, and Playground UI
lib/                         Chinese/English course data and browser-local state
examples/codepilot-cli/      Cancellable mock streaming CLI
scripts/verify-lesson.mjs    Lesson acceptance entry point
docs/                        Course blueprint and architecture
```

## Playground security boundary

- Monaco's TypeScript Worker performs diagnostics and emit;
- emitted JavaScript runs in a separate Web Worker;
- execution has a two-second timeout;
- no Node.js APIs are exposed and no network requests are sent;
- drafts remain in the current browser.

## Technology

TypeScript, React 19, Next-compatible Vinext routing, Vite, Monaco Editor, Vitest, and Cloudflare Workers. Later course phases add NestJS, Drizzle, SQLite/PostgreSQL, and an OpenAI-compatible provider boundary.
