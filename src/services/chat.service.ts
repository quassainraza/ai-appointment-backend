import { prisma } from "@/supabase";
import { AiService } from "./ai.service";

export class ChatService {
  private aiService = new AiService();

  public async processMessage(
    userId: string,
    message: string,
    sessionId?: string,
  ) {
    let currentSessionId = sessionId;

    // 1. If no session ID, create a new chat session..
    if (!currentSessionId) {
      const newSession = await prisma.chatSession.create({
        data: {
          user_id: userId,
        },
      });
      currentSessionId = newSession.id;
    }

    // 2. Save the user's message to the Database
    await prisma.chatMessage.create({
      data: {
        session_id: currentSessionId,
        sender: "user",
        content: message,
      },
    });

    // 3. Fetch the last 5 messages for Multi-Turn Memory..
    const history = await prisma.chatMessage.findMany({
      where: { session_id: currentSessionId },
      orderBy: { created_at: "asc" },
      take: -5, // Only send the last 5 to save AI tokens..
    });

    // 4. Call Mistral AI..
    const aiResponse = await this.aiService.getAppointmentExtraction(
      history,
      message,
    );

    // 5. Save AI's reply to the database
    await prisma.chatMessage.create({
      data: {
        session_id: currentSessionId,
        sender: "ai",
        content: aiResponse.reply,
      },
    });

    // 6. Return payload to frontend
    return {
      sessionId: currentSessionId,
      aiReply: aiResponse.reply,
      isComplete: aiResponse.isComplete,
      extractedData: aiResponse.extractedData, // Frontend will use this to populate the form!
    };
  }
}
