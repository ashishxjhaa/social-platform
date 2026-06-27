import type { Request, Response } from "express";
import { prisma } from "../db/db";

export const getVideoComments = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params as { videoId: string };

    const comments = await prisma.comment.findMany({
      where: {
        videoId,
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
      message: "Comments fetched successfully",
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { videoId } = req.params as { videoId: string };
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!content) {
      return res.status(400).json({
        error: "Content is required",
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

    const comment = await prisma.comment.create({
      data: {
        content,
        ownerId: userId,
        videoId,
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

    return res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { commentId } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!content) {
      return res.status(400).json({
        error: "Content is required",
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

    if (comment.ownerId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    const updatedComment = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content,
      },
    });

    return res.status(200).json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { commentId } = req.params;

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

    if (comment.ownerId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    return res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
