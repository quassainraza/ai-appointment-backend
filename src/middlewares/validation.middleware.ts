import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validationMiddleware = (schema: ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Send a clean 400 Bad Request to the client
        res.status(400).json({
          error: "Validation failed",
          details: error.issues.map((issue) => ({
            message: issue.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};
