import type { Request, Response } from "express";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { prisma } from "../db/db";

export const publishVideo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        error: "Title and description are required",
      });
    }

    const videoLocalPath = (req.files as { videoFile?: Express.Multer.File[] })
      .videoFile?.[0]?.path;

    const thumbnailLocalPath = (
      req.files as { thumbnail?: Express.Multer.File[] }
    ).thumbnail?.[0]?.path;

    if (!videoLocalPath) {
      return res.status(400).json({
        error: "Video file is required",
      });
    }

    if (!thumbnailLocalPath) {
      return res.status(400).json({
        error: "Thumbnail is required",
      });
    }

    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!video?.secure_url) {
      return res.status(500).json({
        error: "Failed to upload video",
      });
    }

    if (!thumbnail?.secure_url) {
      return res.status(500).json({
        error: "Failed to upload thumbnail",
      });
    }

    const publishedVideo = await prisma.video.create({
      data: {
        title,
        description,
        videoFile: video.secure_url,
        thumbnail: thumbnail.secure_url,
        duration: Math.floor(video.duration ?? 0),
        ownerId: userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        videoFile: true,
        duration: true,
        views: true,
        isPublished: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "Video published successfully",
      video: publishedVideo,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getAllVideos = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
};

export const getVideoById = async (req: Request, res: Response) => {
  const { videoId } = req.params;
  //TODO: get video by id
};

export const updateVideo = async (req: Request, res: Response) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
};

export const deleteVideo = async (req: Request, res: Response) => {
  const { videoId } = req.params;
  //TODO: delete video
};

export const togglePublishStatus = async (req: Request, res: Response) => {
  const { videoId } = req.params;
};
