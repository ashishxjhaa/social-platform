import jwt, { type SignOptions } from "jsonwebtoken";

export const generateAccessToken = (userId: string) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"],
    }
  );
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"],
    }
  );
};
