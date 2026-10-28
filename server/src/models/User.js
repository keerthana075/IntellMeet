import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, select: false, default: null },
    role: { type: String, enum: ["ADMIN", "MEMBER"], default: "MEMBER" },
    authProvider: { type: String, enum: ["LOCAL", "GOOGLE"], default: "LOCAL" },
    googleSubject: { type: String, unique: true, sparse: true, select: false },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.googleSubject;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema);
