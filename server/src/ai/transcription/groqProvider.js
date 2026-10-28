/* global FormData, AbortController, fetch */
import { normalizeTranscriptResult } from "./normalizeTranscript.js";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export class GroqTranscriptionProvider {
  constructor({
    apiKey = process.env.GROQ_API_KEY,
    baseUrl = process.env.GROQ_API_BASE_URL || "https://api.groq.com/openai/v1",
    model = process.env.GROQ_TRANSCRIPTION_MODEL || "whisper-large-v3-turbo",
    timeoutMs = Number(process.env.AI_TRANSCRIPTION_TIMEOUT_MS || 90_000),
  } = {}) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.model = model;
    this.timeoutMs = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 90_000;
  }

  get name() {
    return "groq";
  }

  async transcribeFromUrl({ url, language }) {
    if (!this.apiKey) required("GROQ_API_KEY");
    if (typeof url !== "string" || !url.startsWith("https://")) {
      throw new Error("A secure recording URL is required for transcription");
    }

    const form = new FormData();
    form.append("url", url);
    form.append("model", this.model);
    form.append("response_format", "verbose_json");
    form.append("temperature", "0");
    form.append("timestamp_granularities[]", "segment");
    if (language) form.append("language", language);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response;
    try {
      response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: form,
        signal: controller.signal,
      });
    } catch (error) {
      if (error?.name === "AbortError") throw new Error("Transcription provider timed out");
      throw new Error("Transcription provider is unreachable");
    } finally {
      clearTimeout(timer);
    }

    let payload;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const providerMessage = payload?.error?.message;
      throw new Error(
        typeof providerMessage === "string"
          ? `Transcription provider rejected the request: ${providerMessage.slice(0, 300)}`
          : `Transcription provider returned HTTP ${response.status}`
      );
    }

    return {
      provider: this.name,
      model: this.model,
      ...normalizeTranscriptResult(payload),
    };
  }
}
