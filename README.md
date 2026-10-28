# IntellMeet — ZIDIO Project

IntellMeet is an AI-powered enterprise meeting and collaboration platform developed as a team internship project.

## Architecture ownership

- **Backend & Data** — Node.js, Express, MongoDB, Redis, authentication, APIs, validation and security.
- **Frontend & UX** — React, TypeScript, Vite and product UI.
- **Real-Time Systems** — Socket.io and WebRTC.
- **AI Intelligence** — transcription, summaries and action-item extraction.

## Repository workflow

```text
feature/* / fix/* / refactor/* / test/* / chore/* / infra/*
                              ↓
                           develop
                              ↓
                     release verification
                              ↓
                            main
```

- `main` is release-ready only.
- `develop` is the integration branch.
- all implementation work goes through pull requests.
- CI must be green before merge.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [branching workflow](docs/engineering/branching.md).

## Current backend foundation

The backend currently includes:

- Express application structure
- MongoDB/Mongoose
- JWT authentication foundation
- teams, meetings, tasks and action-item APIs
- Redis caching
- secure Cloudinary signed-upload support
- Docker
- backend CI and container publishing workflow

Additional features will be introduced through isolated, reviewable pull requests.
