import type { Request, Response } from "express";
import { prisma } from "../db/db";

export const getVideoComments = async (req: Request, res: Response) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
};

export const addComment = async (req: Request, res: Response) => {
  // TODO: add a comment to a video
};

export const updateComment = async (req: Request, res: Response) => {
  // TODO: update a comment
};

export const deleteComment = async (req: Request, res: Response) => {
  // TODO: delete a comment
};
