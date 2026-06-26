import { z } from "zod";
import type { Request, Response } from "express";
import { prisma } from "../db/db";
import { uploadOnCloudinary } from "../utils/cloudinary";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens";
import jwt from "jsonwebtoken";
import { deleteImageFromCloudinary } from "../utils/image";

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters"),
  email: z.email("Please enter a valid email").trim().toLowerCase(),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  username: z.string("username is required").trim().toLowerCase().optional(),
  email: z.email("email is required").trim().toLowerCase().optional(),
  password: z.string().min(1, "password is required"),
});

export const registerUser = async (req: Request, res: Response) => {
  try {
    const parsedResult = registerSchema.safeParse(req.body);
    if (!parsedResult.success) {
      return res.status(400).json({
        error: parsedResult.error.flatten().fieldErrors,
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: parsedResult.data.email },
          { username: parsedResult.data.username },
        ],
      },
    });
    if (existingUser) {
      return res.status(409).json({
        error: "Username or email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      parsedResult.data.password,
      process.env.SALT_ROUNDS!
    );

    const avatarLocalPath = (req.files as { avatar?: Express.Multer.File[] })
      .avatar?.[0]?.path;

    const coverImageLocalPath = (
      req.files as { coverImage?: Express.Multer.File[] }
    ).coverImage?.[0]?.path;

    if (!avatarLocalPath) {
      return res.status(400).json({
        error: "Avatar file is required",
      });
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
      return res.status(500).json({
        error: "Failed to upload avatar",
      });
    }

    const user = await prisma.user.create({
      data: {
        username: parsedResult.data.username,
        email: parsedResult.data.email,
        fullName: parsedResult.data.fullName,
        password: hashedPassword,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url,
      },
    });

    const safeUser = await prisma.user.findUnique({
      where: { id: user.id },
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

    res.status(201).json({
      message: "User registered successfully",
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Register failed",
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const parsedResult = loginSchema.safeParse(req.body);
    if (!parsedResult.success) {
      return res.status(400).json({
        error: parsedResult.error.flatten().fieldErrors,
      });
    }
    const { username, email, password } = parsedResult.data;
    if (!username && !email) {
      return res.status(400).json({
        error: "username or email is required",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (!user) {
      return res.status(400).json({
        error: "Invalid user credentials",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const refreshToken = generateRefreshToken(user.id);
    const accessToken = generateAccessToken(user.id);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken,
      },
    });

    res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .json({
        message: "Login successfully",
        accessToken,
        refreshToken,
      });
  } catch (error) {
    return res.status(500).json({
      error: "Login failed",
    });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        refreshToken: null,
      },
    });

    return res
      .status(200)
      .clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .json({
        message: "User logged out",
      });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to logout",
    });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    return res.status(401).json({
      error: "Unautorized request",
    });
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );

    const user = await prisma.user.findUnique({
      where: { id: decodedToken?.id },
    });
    if (!user) {
      return res.status(401).json({
        error: "Invalid refresh token",
      });
    }

    if (incomingRefreshToken !== user.refreshToken) {
      return res.status(401).json({
        error: "Refresh token is expired or used",
      });
    }

    const refreshToken = generateRefreshToken(user.id);
    const accessToken = generateAccessToken(user.id);

    res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .json({
        message: "Access token refreshed",
        accessToken,
        refreshToken,
      });
  } catch (error) {
    return res.json(401).json({
      error: "Invalid refresh token",
    });
  }
};

export const changeCurrentPassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        error: "Both fields are required",
      });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        error: "Invalid old password",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        error: "New password must be different",
      });
    }

    const hashNewPassword = await bcrypt.hash(
      newPassword,
      process.env.SALT_ROUNDS!
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashNewPassword,
      },
    });

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getCurrentuser = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    return res.status(200).json({
      message: "Current user fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateAccountDetails = async (req: Request, res: Response) => {
  try {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: userId,
        },
      },
    });
    if (existingUser) {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { fullName, email },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: "Account details updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateUserAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
      return res.status(400).json({
        error: "Avatar file is missing",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        avatar: true,
      },
    });

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.secure_url) {
      return res.status(400).json({
        error: "Failed to upload avatar",
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatar.secure_url },
      select: { avatar: true },
    });

    await deleteImageFromCloudinary(existingUser?.avatar ?? "");

    return res.status(200).json({
      message: "Avatar updated successfully",
      avatar: user.avatar,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateUserCoverImage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
      return res.status(400).json({
        error: "Cover image file is missing",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        coverImage: true,
      },
    });

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage?.secure_url) {
      return res.status(400).json({
        error: "Failed to upload cover Image",
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { coverImage: coverImage.secure_url },
      select: { coverImage: true },
    });

    await deleteImageFromCloudinary(existingUser?.coverImage ?? "");

    return res.status(200).json({
      message: "Cover Image updated successfully",
      coverImage: user.coverImage,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getUserChannelProfile = async (req: Request, res: Response) => {
  try {
    const { username } = req.params as { username: string };
    if (!username?.trim()) {
      return res.status(400).json({
        error: "username is required",
      });
    }

    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const channel = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        avatar: true,
        coverImage: true,
      },
    });

    if (!channel) {
      return res.status(404).json({
        error: "Channel not found",
      });
    }

    const subscribersCount = await prisma.subscription.count({
      where: {
        channelId: channel.id,
      },
    });

    const channelsSubscribedToCount = await prisma.subscription.count({
      where: {
        SubscriberId: channel.id,
      },
    });

    const subscription = await prisma.subscription.findFirst({
      where: {
        channelId: channel.id,
        SubscriberId: currentUserId,
      },
    });

    return res.status(200).json({
      message: "Channel fetched successfully",
      channel: {
        fullName: channel.fullName,
        username: channel.username,
        email: channel.email,
        avatar: channel.avatar,
        coverImage: channel.coverImage,
        subscribersCount,
        channelsSubscribedToCount,
        isSubscribed: !!subscription,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getWatchHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        watchHistory: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            duration: true,
            views: true,
            isPublished: true,
            createdAt: true,
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
    });

    return res.status(200).json({
      message: "Watch history fetched successfully",
      watchHistory: user?.watchHistory ?? [],
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
