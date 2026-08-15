import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import winston, { Logger } from "winston";
import { rateLimit } from "express-rate-limit";
import { IRoute } from "@/interfaces/route.interface";
import { prisma } from "@/supabase";
import { HttpException } from "@/exceptions/HttpException";
import { ZodError } from "zod";

export class App {
  private app: express.Application;
  private logger: Logger;

  constructor(routes: Array<IRoute>) {
    this.app = express();
    this.logger = this.initializeLogger();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);

    this.initializeErrorHandling();
  }

  private async connectToDatabase(): Promise<void> {
    this.logger.info("Connecting to the database");
    await prisma.$connect();
    this.logger.info("Database connection established");
  }

  private initializeLogger(): winston.Logger {
    return winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  private initializeMiddlewares(): void {
    // Build array of permitted origins (filters out undefined values)
    const allowedOrigins = [
      "http://localhost:5173",
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[];

    this.app.use(express.json());
    this.app.use(
      cors({
        origin: (origin, callback) => {
          // Allow server-to-server / Postman calls (no origin)
          // OR requests matching allowed origins or wildcard setting
          if (
            !origin ||
            allowedOrigins.includes(origin) ||
            process.env.FRONTEND_URL === "*"
          ) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      }),
    );

    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: { error: "Too many requests, please try again later." },
    });
    this.app.use("/api/", apiLimiter);

    this.logger.info("Middlewares initialized.");
  }
  private initializeRoutes(routes: Array<IRoute>): void {
    this.app.get("/health", (req: Request, res: Response) => {
      res.status(200).json({ status: "ok", message: "API is running" });
    });

    // We will mount router here:
    // this.app.use('/api/auth', authRoutes);
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });
    this.logger.info("Routes initialized.");
  }

  private initializeErrorHandling(): void {
    // 404 Handler
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.status(404).json({ error: "Route not found" });
    });

    // Global Error Handler
    this.app.use(
      (error: Error, req: Request, res: Response, next: NextFunction) => {
        // 1. Handle Zod Validation Errors (400)
        if (error instanceof ZodError) {
          this.logger.warn(`Validation Error: ${error.message}`);
          res.status(400).json({
            error: "Validation Error",
            details: error.issues.map((issue) => ({
              message: issue.message,
            })),
          });
          return;
        }

        // 2. Handle Custom Http Exceptions (e.g., 409 Email already exists, 401 Unauthorized)
        if (error instanceof HttpException) {
          this.logger.warn(`HTTP ${error.status}: ${error.message}`);
          res.status(error.status).json({ error: error.message });
          return;
        }

        // 3. Handle Unknown/Internal Errors (500)
        this.logger.error(`Error: ${error.message}\nStack: ${error.stack}`);
        res.status(500).json({ error: "Internal Server Error" });
      },
    );
  }

  public async listen(port: number, callback?: () => void): Promise<void> {
    await this.connectToDatabase();
    this.app.listen(port, () => {
      this.logger.info(`Server is running on port ${port}`);
      this.logger.info(`Open your browser at http://localhost:${port}`);
      this.logger.info(`Press Ctrl+C to stop the server`);
      if (callback) {
        callback();
      }
    });
  }
}
