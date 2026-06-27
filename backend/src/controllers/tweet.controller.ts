import type { Request, Response } from "express";
import { prisma } from "../db/db";

export const createTweet = async (req: Request, res: Response) => {
  //TODO: create tweet
};

export const getUserTweets = async (req: Request, res: Response) => {
  // TODO: get user tweets
};

export const updateTweet = async (req: Request, res: Response) => {
  //TODO: update tweet
};

export const deleteTweet = async (req: Request, res: Response) => {
  //TODO: delete tweet
};
