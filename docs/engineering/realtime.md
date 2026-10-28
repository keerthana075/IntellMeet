# Realtime Architecture

Socket.io runs on the same HTTP server as the Express API.

## Authentication

Clients connect with the short-lived access token in the Socket.io auth payload:

```js
io(API_ORIGIN, { auth: { token: accessToken } })
```

The server verifies the JWT before accepting the connection. Refresh tokens are never sent through Socket.io.

## Meeting authorization

Joining a Socket.io room reuses backend meeting/team authorization:
- host is allowed;
- an existing participant is allowed;
- a member of the meeting's team is allowed;
- ended/cancelled meetings reject new joins.

A successful join atomically adds the user to the meeting participant set.

## Events

Client -> server:
- `meeting:join`
- `meeting:leave`
- `chat:send`
- `typing:start`
- `typing:stop`

Server -> client:
- `participant:joined`
- `participant:left`
- `chat:message`
- `typing:start`
- `typing:stop`

## Persistence and scaling

Chat messages are persisted in MongoDB and can be loaded via:
`GET /api/meetings/:meetingId/messages`.

When Redis is available, Socket.io uses the Redis adapter so rooms/events can span multiple Node instances. If Redis adapter setup fails, the process remains usable with the in-memory adapter for local/demo operation.
