"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMiddleware = void 0;
const zod_1 = require("zod");
const validationMiddleware = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
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
exports.validationMiddleware = validationMiddleware;
