import mongoose from "mongoose";

const authSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    refreshTokenHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    revokedAt: { type: Date, default: null, index: true },
    userAgent: { type: String, maxlength: 512, default: "" },
    ip: { type: String, maxlength: 128, default: "" },
  },
  { timestamps: true }
);

authSessionSchema.index({ user: 1, revokedAt: 1 });

export const AuthSession = mongoose.model("AuthSession", authSessionSchema);
