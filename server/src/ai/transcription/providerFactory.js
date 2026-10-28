import { GroqTranscriptionProvider } from "./groqProvider.js";

export function getTranscriptionProvider() {
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();

  if (provider === "groq") return new GroqTranscriptionProvider();
  throw new Error(`Unsupported transcription provider: ${provider}`);
}
