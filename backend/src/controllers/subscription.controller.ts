import type { Request, Response } from "express";
import { prisma } from "../db/db";

export const toggleSubscription = async (req: Request, res: Response) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
};

// controller to return subscriber list of a channel
export const getUserChannelSubscribers = async (
  req: Request,
  res: Response
) => {
  const { channelId } = req.params;
};

// controller to return channel list to which user has subscribed
export const getSubscribedChannels = async (req: Request, res: Response) => {
  const { subscriberId } = req.params;
};
