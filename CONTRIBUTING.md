# Contributing to IntellMeet

## Branch model

- `main`: release-ready code only.
- `develop`: integration branch.
- `feature/*`: product features.
- `fix/*`: bug fixes.
- `refactor/*`: behavior-preserving refactors.
- `test/*`: test-only changes.
- `chore/*`: repository/tooling maintenance.
- `infra/*`: deployment and infrastructure.

All implementation branches must start from the latest `develop` unless a release hotfix is explicitly required.

## Pull requests

All normal pull requests target `develop`.

A pull request is ready to merge only when:

1. CI is green.
2. The change is scoped to one responsibility.
3. Validation and authorization are included where applicable.
4. Tests are added or updated for changed behavior.
5. Environment variables are documented in `.env.example`.
6. No secrets, credentials, tokens, or private URLs are committed.
7. API, Socket, AI, or data-contract changes are documented.
8. Another team member can understand the change from the PR description.

Only tested release PRs should merge `develop` into `main`.

## Commit messages

Use Conventional Commit style:

- `feat(auth): add refresh token rotation`
- `fix(meetings): reject unauthorized meeting updates`
- `refactor(frontend): split dashboard into page components`
- `test(auth): cover revoked refresh token`
- `chore(ci): add frontend quality gate`

Avoid vague messages such as `update`, `changes`, or `final`.

## Code ownership

Do not silently edit another subsystem's contract.

- Frontend requests API changes from backend ownership.
- Realtime documents Socket event changes.
- AI documents request/output schema changes.
- Backend documents REST/data-contract changes.

## Security baseline

Never commit:

- `.env`
- API secrets
- JWT secrets
- OAuth client secrets
- database credentials
- Redis credentials
- Cloudinary API secret

Public/client-side values must still be documented explicitly.

## Review philosophy

Prefer small pull requests that can be reviewed, tested, and reverted independently.
