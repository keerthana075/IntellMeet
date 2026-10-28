import { createUploadSignature } from "../services/mediaService.js";
import { HttpError } from "../utils/httpError.js";

export async function createSignature(req, res, next) {
  try {
    const { purpose } = req.body ?? {};

    if (typeof purpose !== "string") {
      throw new HttpError(400, "purpose is required");
    }

    const upload = createUploadSignature({
      userId: req.auth.userId,
      purpose,
    });

    res.status(200).json({
      success: true,
      data: upload,
    });
  } catch (error) {
    next(error);
  }
}
