# API Validation and Authorization

## Request boundary

Protected API routes follow this order:

```text
authentication -> schema validation -> controller -> service authorization -> persistence
```

Zod schemas reject malformed IDs, unsupported enum values, unknown fields, oversized strings, and invalid request shapes before business logic runs.

## Resource authorization invariants

- Team membership is required to read team-scoped resources.
- Only the team owner can add members.
- Task assignees must belong to the task's team.
- Tasks may only reference meetings from the same team.
- Only a team owner or task creator can delete a task.
- Only a meeting host can edit or delete that meeting.
- Meeting status transitions follow a constrained lifecycle.
- Live meetings cannot be deleted.
- Action-item assignees must be meeting participants or members of the linked team.
- Client-created action items are always persisted with source `MANUAL`.

These checks live in services so HTTP, Socket.io, and future background workers can reuse the same business rules.
