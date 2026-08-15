import { Router } from "express";
import { IRoute } from "@/interfaces/route.interface";
import { ChatController } from "@/controllers/chat.controller";
import { validationMiddleware } from "@/middlewares/validation.middleware";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { ChatMessageSchema } from "@/dtos/chat.dto";

export class ChatRoute implements IRoute {
  public path = "/api/chat";
  public router = Router();
  public chatController = new ChatController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}/send`,
      authMiddleware, // 1- protect route with authMiddleware
      validationMiddleware(ChatMessageSchema), // 2. should validate the request body against the ChatMessageSchema
      this.chatController.sendMessage, // 3. handle the request with the sendMessage method of ChatController
    );
  }
}
