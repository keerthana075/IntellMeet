import mongoose from "mongoose";

const actionItemSchema = new mongoose.Schema(
  {
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting", required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    dueAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["OPEN", "DONE", "DISMISSED"],
      default: "OPEN",
    },
    source: { type: String, enum: ["AI", "MANUAL"], default: "MANUAL" },
  },
  { timestamps: true }
);

actionItemSchema.index({ meeting: 1, createdAt: 1 });

export const ActionItem = mongoose.model("ActionItem", actionItemSchema);
