"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessageSchema = void 0;
const zod_1 = require("zod");
exports.ChatMessageSchema = zod_1.z.object({
    sessionId: zod_1.z.string().uuid().optional(), // Optional: If empty, we create a new chat session
    message: zod_1.z.string().min(1, "Message cannot be empty"),
});
