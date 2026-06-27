import type { Request, Response } from "express";
import { prisma } from "../db/db";

export const toggleSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { channelId } = req.params as { channelId: string };

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (userId === channelId) {
      return res.status(400).json({
        error: "You cannot subscribe to yourself",
      });
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        SubscriberId: userId,
        channelId,
      },
    });

    if (existingSubscription) {
      await prisma.subscription.delete({
        where: {
          id: existingSubscription.id,
        },
      });

      return res.status(200).json({
        message: "Unsubscribed successfully",
      });
    }

    await prisma.subscription.create({
      data: {
        SubscriberId: userId,
        channelId,
      },
    });

    return res.status(201).json({
      message: "Subscribed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getUserChannelSubscribers = async (
  req: Request,
  res: Response
) => {
  try {
    const { channelId } = req.params as { channelId: string };

    const subscribers = await prisma.subscription.findMany({
      where: {
        channelId,
      },
      include: {
        subscriber: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Subscribers fetched successfully",
      subscribers,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getSubscribedChannels = async (req: Request, res: Response) => {
  try {
    const { subscriberId } = req.params as { subscriberId: string };

    const channels = await prisma.subscription.findMany({
      where: {
        SubscriberId: subscriberId,
      },
      include: {
        channel: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Subscribed channels fetched successfully",
      channels,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
