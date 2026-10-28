import mongoose from "mongoose";

const transcriptSegmentSchema = new mongoose.Schema(
  {
    startMs: { type: Number, min: 0, required: true },
    endMs: { type: Number, min: 0, required: true },
    text: { type: String, required: true, trim: true, maxlength: 10000 },
    speaker: { type: String, default: "", maxlength: 120 },
  },
  { _id: false }
);

const transcriptSchema = new mongoose.Schema(
  {
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting", required: true, index: true },
    recording: { type: mongoose.Schema.Types.ObjectId, ref: "Recording", required: true, index: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    language: { type: String, default: "" },
    status: {
      type: String,
      enum: ["PROCESSING", "COMPLETED", "FAILED"],
      default: "PROCESSING",
      index: true,
    },
    text: { type: String, default: "" },
    durationSeconds: { type: Number, min: 0, default: 0 },
    segments: { type: [transcriptSegmentSchema], default: [] },
    providerRequestId: { type: String, default: "", maxlength: 256 },
    failureReason: { type: String, default: "", maxlength: 500 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

transcriptSchema.index({ meeting: 1, recording: 1 }, { unique: true });
transcriptSchema.index({ meeting: 1, createdAt: -1 });

export const Transcript = mongoose.model("Transcript", transcriptSchema);
