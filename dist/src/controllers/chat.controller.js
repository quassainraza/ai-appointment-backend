"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chat_service_1 = require("../services/chat.service");
class ChatController {
    chatService = new chat_service_1.ChatService();
    sendMessage = async (req, res, next) => {
        try {
            // req.user is guaranteed to exist because of authMiddleware
            const userId = req.user.id;
            const { message, sessionId } = req.body;
            const result = await this.chatService.processMessage(userId, message, sessionId);
            res.status(200).json({ message: "Message processed", data: result });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ChatController = ChatController;
