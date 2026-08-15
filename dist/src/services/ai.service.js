"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const mistralai_1 = require("@mistralai/mistralai");
const HttpException_1 = require("../exceptions/HttpException");
class AiService {
    client;
    constructor() {
        if (!process.env.MISTRAL_API_KEY) {
            throw new Error("MISTRAL_API_KEY is not configured");
        }
        this.client = new mistralai_1.Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    }
    async getAppointmentExtraction(chatHistory, newMessage) {
        const today = new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        const systemPrompt = `
      You are an appointment booking assistant. Today is ${today}.
      Your goal is to extract 3 details from the user: "title" (what the appointment is for), "date", and "time".

      You MUST respond ONLY in valid JSON format.
      If you are missing details, ask for them politely in the "reply" field, and set "isComplete" to false.
      If you have all 3 details, set "isComplete" to true, and confirm them in the "reply" field.

      JSON Schema:
      {
        "reply": "Your conversational response to the user",
        "isComplete": boolean,
        "extractedData": {
          "title": string | null,
          "date": string | null (YYYY-MM-DD),
          "time": string | null (HH:MM)
        }
      }
    `;
        //it will map db history to the format required by Mistral AI
        const messages = chatHistory.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content,
        }));
        // prepend system prompt
        messages.unshift({ role: "system", content: systemPrompt });
        messages.push({ role: "user", content: newMessage });
        try {
            const chatResponse = await this.client.chat.complete({
                model: "mistral-small-latest",
                messages: messages,
                responseFormat: { type: "json_object" }, // it will send json output
            });
            const responseContent = chatResponse.choices?.[0]?.message?.content;
            if (!responseContent)
                throw new HttpException_1.HttpException(500, "AI returned empty response");
            return JSON.parse(responseContent);
        }
        catch (error) {
            console.error("Mistral AI Error:", error);
            throw new HttpException_1.HttpException(502, "Failed to communicate with AI provider");
        }
    }
}
exports.AiService = AiService;
