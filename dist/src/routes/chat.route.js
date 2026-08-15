"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoute = void 0;
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const chat_dto_1 = require("../dtos/chat.dto");
class ChatRoute {
    path = "/api/chat";
    router = (0, express_1.Router)();
    chatController = new chat_controller_1.ChatController();
    constructor() {
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/send`, auth_middleware_1.authMiddleware, // 1- protect route with authMiddleware
        (0, validation_middleware_1.validationMiddleware)(chat_dto_1.ChatMessageSchema), // 2. should validate the request body against the ChatMessageSchema
        this.chatController.sendMessage);
    }
}
exports.ChatRoute = ChatRoute;
