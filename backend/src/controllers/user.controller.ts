import { z } from "zod";
import type { Request, Response } from "express";
import { prisma } from "../db/db";
import { uploadOnCloudinary } from "../utils/cloudinary";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens";

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

    const hashedPassword = await bcrypt.hash(parsedResult.data.password, 10);

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
