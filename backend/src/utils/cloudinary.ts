import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (file: string | undefined) => {
  try {
    if (!file) return null;

    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });

    // remove the locally saved file
    fs.unlinkSync(file);

    return response;
  } catch (error) {
    if (file) fs.unlinkSync(file);
    return null;
  }
};
