import mongoose from "mongoose";

const recordingSchema = new mongoose.Schema(
  {
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting", required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: { type: String, enum: ["CLOUDINARY"], default: "CLOUDINARY" },
    publicId: { type: String, required: true, unique: true, index: true },
    secureUrl: { type: String, default: "" },
    format: { type: String, default: "" },
    resourceType: { type: String, enum: ["video"], default: "video" },
    bytes: { type: Number, min: 0, default: 0 },
    durationSeconds: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ["UPLOADING", "READY", "FAILED", "DELETED"],
      default: "UPLOADING",
      index: true,
    },
    failureReason: { type: String, maxlength: 500, default: "" },
  },
  { timestamps: true }
);

recordingSchema.index({ meeting: 1, createdAt: -1 });

export const Recording = mongoose.model("Recording", recordingSchema);
