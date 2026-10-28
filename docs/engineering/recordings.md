# Meeting Recording Lifecycle

Recordings use direct signed uploads to Cloudinary so large media does not pass through the Express process.

## Flow

1. Authenticated meeting host requests `POST /api/meetings/:meetingId/recordings/upload`.
2. Backend creates an `UPLOADING` Recording document and signs one exact Cloudinary public ID.
3. Browser uploads directly to the returned Cloudinary video endpoint.
4. Browser calls `POST /api/meetings/:meetingId/recordings/:recordingId/complete`.
5. Backend queries Cloudinary's API for the expected public ID.
6. Only verified provider metadata is persisted and status becomes `READY`.

The completion request does not accept a client-provided URL, byte count, format, or duration.

## Authorization

- Only the meeting host can create/finalize/delete recordings.
- Authorized meeting participants may list ready/non-deleted recording metadata.
- Provider secrets never leave the backend.

## Limits

The application rejects verified assets above 500 MB in the internship deployment. Production limits can be changed according to the chosen media plan and retention policy.
