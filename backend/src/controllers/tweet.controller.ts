import type { Request, Response } from "express";
import { prisma } from "../db/db";

export const createTweet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        error: "Content is required",
      });
    }

    const tweet = await prisma.tweet.create({
      data: {
        content,
        ownerId: userId,
      },
    });

    return res.status(201).json({
      message: "Tweet created successfully",
      tweet,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getUserTweets = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };

    const tweets = await prisma.tweet.findMany({
      where: {
        ownerId: userId,
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
      message: "Tweets fetched successfully",
      tweets,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateTweet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { tweetId } = req.params;
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

    if (tweet.ownerId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    const updatedTweet = await prisma.tweet.update({
      where: {
        id: tweetId,
      },
      data: {
        content,
      },
    });

    return res.status(200).json({
      message: "Tweet updated successfully",
      tweet: updatedTweet,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const deleteTweet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { tweetId } = req.params;

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

    if (tweet.ownerId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    await prisma.tweet.delete({
      where: {
        id: tweetId,
      },
    });

    return res.status(200).json({
      message: "Tweet deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
