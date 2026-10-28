# Branching and Release Workflow

## Normal development

```text
feature/* ─┐
fix/*     ─┼──> develop ──> release verification ──> main
refactor/* ┤
test/*    ─┤
chore/*   ─┤
infra/*   ─┘
```

## Rules

1. Do not push feature work directly to `main`.
2. Do not bypass CI.
3. Rebase or merge the latest `develop` before final review when the branch is stale.
4. Resolve conflicts in the feature branch, not after merging.
5. Merge only after required checks succeed.
6. A release to `main` must come from the tested integration state.

## Definition of done

A feature is not complete merely because the happy path works.

Where relevant, every pull request must account for:

- request/data validation
- authentication
- resource authorization
- error handling
- tests
- logging/observability impact
- configuration/environment variables
- documentation
- CI compatibility
