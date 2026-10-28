import { cloudinary, configureCloudinary, getCloudinaryPublicConfig } from "../config/cloudinary.js";
import { HttpError } from "../utils/httpError.js";

const UPLOAD_PURPOSES = {
  avatar: {
    folder: "intellmeet/avatars",
    resourceType: "image",
  },
  recording: {
    folder: "intellmeet/recordings",
    resourceType: "video",
  },
};

export function createUploadSignature({ userId, purpose }) {
  const config = UPLOAD_PURPOSES[purpose];
  if (!config) {
    throw new HttpError(400, "Unsupported upload purpose");
  }

  configureCloudinary();

  const timestamp = Math.floor(Date.now() / 1000);
  const publicIdPrefix = purpose === "avatar"
    ? `user_${userId}`
    : `recording_${userId}_${timestamp}`;

  const paramsToSign = {
    folder: config.folder,
    public_id: publicIdPrefix,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  const { cloudName, apiKey } = getCloudinaryPublicConfig();

  return {
    cloudName,
    apiKey,
    signature,
    timestamp,
    folder: config.folder,
    publicId: publicIdPrefix,
    resourceType: config.resourceType,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${config.resourceType}/upload`,
  };
}
