import type { Request, Response } from "express";
import { prisma } from "../db/db";

export const toggleVideoLike = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { videoId } = req.params as { videoId: string };

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

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      return res.status(200).json({
        message: "Video unliked successfully",
      });
    }

    await prisma.like.create({
      data: {
        userId,
        videoId,
      },
    });

    return res.status(201).json({
      message: "Video liked successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const toggleCommentLike = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { commentId } = req.params as { commentId: string };

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      return res.status(200).json({
        message: "Comment unliked successfully",
      });
    }

    await prisma.like.create({
      data: {
        userId,
        commentId,
      },
    });

    return res.status(201).json({
      message: "Comment liked successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const toggleTweetLike = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { tweetId } = req.params as { tweetId: string };

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const tweet = await prisma.tweet.findUnique({
      where: {
        id: tweetId,
      },
    });

    if (!tweet) {
      return res.status(404).json({
        error: "Tweet not found",
      });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_tweetId: {
          userId,
          tweetId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      return res.status(200).json({
        message: "Tweet unliked successfully",
      });
    }

    await prisma.like.create({
      data: {
        userId,
        tweetId,
      },
    });

    return res.status(201).json({
      message: "Tweet liked successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getLikedVideos = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const likedVideos = await prisma.like.findMany({
      where: {
        userId,
        videoId: {
          not: null,
        },
      },
      include: {
        video: {
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Liked videos fetched successfully",
      likedVideos,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
