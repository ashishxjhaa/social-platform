import type { Request, Response } from "express";
import { prisma } from "../db/db";

export const toggleVideoLike = async (req: Request, res: Response) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
};

export const toggleCommentLike = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
};

export const toggleTweetLike = async (req: Request, res: Response) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
};

export const getLikedVideos = async (req: Request, res: Response) => {
  //TODO: get all liked videos
};
