import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpException } from "@/exceptions/HttpException";

// Extend Express Request to include user
export interface RequestWithUser extends Request {
  user?: { id: string; email: string; name: string };
}

export const authMiddleware = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(new HttpException(401, "Authentication token missing"));
  }

  try {
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      name: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    next(new HttpException(401, "Invalid or expired token"));
  }
};
