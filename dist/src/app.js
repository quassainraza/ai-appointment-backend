"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const winston_1 = __importDefault(require("winston"));
const express_rate_limit_1 = require("express-rate-limit");
const supabase_1 = require("./supabase");
const HttpException_1 = require("./exceptions/HttpException");
const zod_1 = require("zod");
class App {
    app;
    logger;
    constructor(routes) {
        this.app = (0, express_1.default)();
        this.logger = this.initializeLogger();
        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeErrorHandling();
    }
    async connectToDatabase() {
        this.logger.info("Connecting to the database");
        await supabase_1.prisma.$connect();
        this.logger.info("Database connection established");
    }
    initializeLogger() {
        return winston_1.default.createLogger({
            level: "info",
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ timestamp, level, message }) => {
                return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
            })),
            transports: [new winston_1.default.transports.Console()],
        });
    }
    initializeMiddlewares() {
        this.app.use(express_1.default.json());
        this.app.use((0, cors_1.default)({
            origin: [
                process.env.FRONTEND_URL || "http://localhost:5173",
                "https://hoppscotch.io", // Explicitly allow Hoppscotch
            ],
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true,
        }));
        const apiLimiter = (0, express_rate_limit_1.rateLimit)({
            windowMs: 15 * 60 * 1000,
            max: 100,
            message: { error: "Too many requests, please try again later." },
        });
        this.app.use("/api/", apiLimiter);
        this.logger.info("Middlewares initialized.");
    }
    initializeRoutes(routes) {
        this.app.get("/health", (req, res) => {
            res.status(200).json({ status: "ok", message: "API is running" });
        });
        // We will mount router here:
        // this.app.use('/api/auth', authRoutes);
        routes.forEach((route) => {
            this.app.use("/", route.router);
        });
        this.logger.info("Routes initialized.");
    }
    initializeErrorHandling() {
        // 404 Handler
        this.app.use((req, res, next) => {
            res.status(404).json({ error: "Route not found" });
        });
        // Global Error Handler
        this.app.use((error, req, res, next) => {
            // 1. Handle Zod Validation Errors (400)
            if (error instanceof zod_1.ZodError) {
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
            if (error instanceof HttpException_1.HttpException) {
                this.logger.warn(`HTTP ${error.status}: ${error.message}`);
                res.status(error.status).json({ error: error.message });
                return;
            }
            // 3. Handle Unknown/Internal Errors (500)
            this.logger.error(`Error: ${error.message}\nStack: ${error.stack}`);
            res.status(500).json({ error: "Internal Server Error" });
        });
    }
    async listen(port, callback) {
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
exports.App = App;
