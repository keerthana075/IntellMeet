# IntellMeet Frontend

A responsive React + TypeScript + Vite frontend starter for the IntellMeet ZIDIO project.

## Features included in this UI starter
- Workspace sidebar and responsive mobile navigation
- Overview dashboard with meeting metrics, upcoming meetings, AI insights, recent notes, and team activity
- Meetings page with schedule-meeting modal
- AI notes library with Summary, Transcript, and Action items tabs
- Tasks page with interactive completion checkboxes
- Team directory
- Analytics dashboard with charts
- Settings page with working preference toggles
- Search, notifications popover, toast messages, and responsive layouts

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build

```bash
npm run build
npm run preview
```

## Connect to the backend

This package is a frontend starter with demo/sample data. The UI actions are interactive, but authentication, database persistence, actual video calls, Socket.io events, AI transcription/summarization, and real analytics are not connected yet.

When integrating with the team backend:
1. Add your API base URL to `.env` as `VITE_API_BASE_URL=http://localhost:5000/api`.
2. Create a shared API client (for example, `src/lib/api.ts`) using `fetch` or Axios.
3. Replace the sample arrays in `src/App.tsx` with API responses.
4. Connect login/signup and protected routes to the backend JWT flow.
5. Integrate Socket.io and WebRTC in the meeting room; do not treat the current “Join” toast as a live call.
6. Connect the AI notes interface to the transcription and summarization endpoints.

## Suggested next structure

```text
src/
  components/
    layout/
    meetings/
    notes/
    tasks/
    ui/
  pages/
  context/
  lib/
  types/
  App.tsx
  main.tsx
  styles.css
```

## Team workflow

Work on a feature branch such as `feature/frontend-dashboard` and open a pull request into `develop`, following your project's branching model.
