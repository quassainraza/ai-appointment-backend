import { z } from "zod";

export const ChatMessageSchema = z.object({
  sessionId: z.string().uuid().optional(), // Optional: If empty, we create a new chat session
  message: z.string().min(1, "Message cannot be empty"),
});

export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;
