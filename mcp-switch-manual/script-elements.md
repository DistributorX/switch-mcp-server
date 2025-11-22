# Script Elements vs Expressions

## Script Elements
- Flow elements that host scripts written in supported languages (Node.js/TypeScript preferred).
- Implement entry points such as `jobArrived` (per-job) and `timerFired` (scheduled).
- Representations: script folder (dev-friendly) or script package `.sscript` (deploy-friendly).

## Script Expressions
- Small JavaScript/TypeScript expressions attached to element properties (e.g., job priority).
- Evaluated in job context; read-only access to Switch data. Third-party `node_modules` and many API calls are unavailable.
- API members marked “NOT FOR SCRIPT EXPRESSIONS” are off-limits; prefer simple value calculations.

## Script Program Basics
- Main files: `main.ts` (TypeScript) transpiled to `main.js` (executed) or `main.js` directly.
- Switch scripting API objects include `Switch`, `FlowElement`, `Job`, `Connection`, and document helpers.
- Entry points should generally be `async` to await API calls and promises.
