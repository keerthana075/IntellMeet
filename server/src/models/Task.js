import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting", default: null, index: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
      index: true,
    },
    dueAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ team: 1, status: 1, createdAt: -1 });

export const Task = mongoose.model("Task", taskSchema);
