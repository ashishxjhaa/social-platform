import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db/db";

export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized request",
    });
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as jwt.JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatar: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return res.status(401).json({
        error: "Invalid Access Token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.json(401).json({
      error: "Invalid or expired access token",
    });
  }
};
