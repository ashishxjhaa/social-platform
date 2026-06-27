import { v2 as cloudinary } from "cloudinary";

export const deleteVideoFromCloudinary = async (videoUrl: string) => {
  try {
    if (!videoUrl) return;

    const uploadPart = videoUrl.split("/upload/")[1];

    if (!uploadPart) {
      return;
    }

    // users/video_xyz.mp4
    const path = uploadPart.split("/").slice(1).join("/");

    const extensionIndex = path.lastIndexOf(".");

    if (extensionIndex === -1) {
      return;
    }

    // users/video_xyz
    const publicId = path.substring(0, extensionIndex);

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
  } catch (error) {
    console.error("Error deleting video from Cloudinary:", error);
  }
};
