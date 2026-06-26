import { v2 as cloudinary } from "cloudinary";

export const deleteImageFromCloudinary = async (imageUrl: string) => {
  try {
    if (!imageUrl) return;

    const uploadPart = imageUrl.split("/upload/")[1];

    if (!uploadPart) {
      return;
    }

    // users/avatar_xyz.jpg
    const path = uploadPart.split("/").slice(1).join("/");

    const extensionIndex = path.lastIndexOf(".");

    if (extensionIndex === -1) {
      return;
    }

    // users/avatar_xyz
    const publicId = path.substring(0, extensionIndex);

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
  }
};
