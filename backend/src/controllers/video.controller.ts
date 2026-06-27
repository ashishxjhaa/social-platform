import type { Request, Response } from "express";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { prisma } from "../db/db";
import { deleteImageFromCloudinary } from "../utils/image";
import { deleteVideoFromCloudinary } from "../utils/video";

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
  try {
    const videos = await prisma.video.findMany({
      where: {
        isPublished: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Videos fetched successfully",
      videos,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params as { videoId: string };

    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    if (!video) {
      return res.status(404).json({
        error: "Video not found",
      });
    }

    await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return res.status(200).json({
      message: "Video fetched successfully",
      video,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateVideo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
      },
    });

    if (!video) {
      return res.status(404).json({
        error: "Video not found",
      });
    }

    if (video.ownerId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    const data: any = {};

    if (title) data.title = title;
    if (description) data.description = description;

    const thumbnailLocalPath = req.file?.path;

    if (thumbnailLocalPath) {
      const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

      if (thumbnail?.secure_url) {
        data.thumbnail = thumbnail.secure_url;
      }
    }

    const updatedVideo = await prisma.video.update({
      where: {
        id: videoId,
      },
      data,
    });

    await deleteImageFromCloudinary(video.thumbnail ?? "");

    return res.status(200).json({
      message: "Video updated successfully",
      video: updatedVideo,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { videoId } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
      },
    });

    if (!video) {
      return res.status(404).json({
        error: "Video not found",
      });
    }

    if (video.ownerId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    await prisma.video.delete({
      where: {
        id: videoId,
      },
    });

    await deleteVideoFromCloudinary(video.videoFile);
    await deleteImageFromCloudinary(video.thumbnail);

    return res.status(200).json({
      message: "Video deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const togglePublishStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { videoId } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
      },
    });

    if (!video) {
      return res.status(404).json({
        error: "Video not found",
      });
    }

    if (video.ownerId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    const updatedVideo = await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        isPublished: !video.isPublished,
      },
    });

    return res.status(200).json({
      message: "Publish status updated successfully",
      video: updatedVideo,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
