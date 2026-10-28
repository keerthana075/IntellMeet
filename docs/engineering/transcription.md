# Transcription Architecture

## Provider abstraction

The application calls a provider-neutral transcription service. The internship/demo configuration defaults to Groq:

```env
AI_PROVIDER=groq
GROQ_TRANSCRIPTION_MODEL=whisper-large-v3-turbo
```

Provider-specific HTTP details stay under `src/ai/transcription/`. Business services do not depend on Groq-specific response objects.

A future OpenAI provider can implement the same contract without changing meeting/recording controllers or persistence.

## Processing flow

```text
verified Cloudinary recording
        ↓
host starts transcription
        ↓
Transcript(PROCESSING)
        ↓
provider adapter
        ↓
normalized text + timestamped segments
        ↓
Transcript(COMPLETED)
```

On provider failure, the Transcript becomes `FAILED` with a bounded internal failure reason. The public API returns a controlled 502 error.

## Security and cost controls

- Only the meeting host can start provider processing.
- Only verified `READY` recording URLs are submitted.
- Meeting participants can read transcripts.
- API keys remain server-side.
- Provider calls have a hard timeout.
- Duplicate completed requests are idempotent; a concurrent PROCESSING request is rejected.
- Transcript output is normalized before persistence.

## Current implementation note

This phase performs the provider request in the API process to keep the internship deployment simple and deterministic. Before high-volume production traffic, provider processing should move to a durable background queue/worker with retries and dead-letter handling.
