# Frontend Engineering Baseline

The frontend lives in `IntellMeet-Frontend/` and uses React, TypeScript, and Vite.

## Structure

- `src/components/` — reusable presentation components.
- `src/pages/` — feature/page-level UI.
- `src/data/` — temporary demo fixtures only; remove as real APIs are connected.
- `src/types/` — shared frontend types.

## Rules

1. New network calls must go through a shared API layer rather than page-local `fetch` calls.
2. Demo data must be replaced feature-by-feature as backend integration lands.
3. Authentication, routing, loading/error states, and server state belong outside presentational components.
4. Real-time and AI integrations must use documented contracts.
5. Every frontend PR must pass TypeScript compilation and the production Vite build.
