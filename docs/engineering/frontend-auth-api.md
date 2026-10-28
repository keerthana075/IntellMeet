# Frontend Authentication and API Integration

## Token handling

The browser stores no refresh token in JavaScript-accessible storage.

- Access token: memory only.
- Refresh token: HttpOnly cookie managed by the backend.
- Requests use `credentials: include`.
- Protected API calls retry once after a successful refresh when they receive 401.
- Failed refresh clears the in-memory access token and returns the user to authentication.

## API layer

All network calls belong under `src/api/`.

Pages/components must not scatter direct backend calls throughout UI code.

## Current real-data scope

This phase connects:

- register
- login
- session restoration
- logout
- current user
- meeting listing
- meeting creation

Other demo sections remain visually available but are migrated to real backend data in their dedicated feature phases.
