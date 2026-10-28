# Authentication Architecture

## Token model

IntellMeet uses short-lived bearer access tokens and rotating refresh sessions.

- Access tokens are returned to the authenticated client and expire quickly.
- Refresh tokens are stored only in an HttpOnly cookie.
- The server stores only a bcrypt hash of each refresh token.
- Every device/session has its own `AuthSession` record.
- Refresh rotation replaces the token hash for that session.
- A mismatched token revokes the session as a replay/reuse defense.
- `POST /api/auth/logout-all` revokes all active sessions for the authenticated user.

## Google sign-in

`POST /api/auth/google` accepts a Google ID token and verifies it against `GOOGLE_CLIENT_ID`.

The provider is optional. If `GOOGLE_CLIENT_ID` is not configured, local email/password authentication continues to work and the endpoint returns 503.

## Cookie deployment notes

For cross-site production deployments, set:

```env
AUTH_COOKIE_SAME_SITE=none
AUTH_COOKIE_SECURE=true
TRUST_PROXY=true
```

Use HTTPS. Never expose the refresh token or JWT secrets to frontend code.
