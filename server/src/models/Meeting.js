import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null, index: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    scheduledAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["SCHEDULED", "LIVE", "ENDED", "CANCELLED"],
      default: "SCHEDULED",
      index: true,
    },
    transcript: { type: String, default: "", select: false },
    summary: { type: String, default: "" },
  },
  { timestamps: true }
);

meetingSchema.index({ host: 1, createdAt: -1 });
meetingSchema.index({ team: 1, createdAt: -1 });

export const Meeting = mongoose.model("Meeting", meetingSchema);
