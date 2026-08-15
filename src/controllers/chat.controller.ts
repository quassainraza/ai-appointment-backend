import { Response, NextFunction } from "express";
import { ChatService } from "@/services/chat.service";
import { ChatMessageInput } from "@/dtos/chat.dto";
import { RequestWithUser } from "@/middlewares/auth.middleware";

export class ChatController {
  private chatService = new ChatService();

  public sendMessage = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // req.user is guaranteed to exist because of authMiddleware
      const userId = req.user!.id;
      const { message, sessionId }: ChatMessageInput = req.body;

      const result = await this.chatService.processMessage(
        userId,
        message,
        sessionId,
      );

      res.status(200).json({ message: "Message processed", data: result });
    } catch (error) {
      next(error);
    }
  };
}
