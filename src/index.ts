import dotenv from "dotenv";
import { App } from "./app";
import { AuthRoute } from "@/routes/auth.route";
import { prisma } from "@/supabase";
import { ChatRoute } from "@/routes/chat.route";
import { AppointmentRoute } from "@/routes/appointment.route";

const PORT = process.env.PORT || 3000;

dotenv.config();
const app = new App([
  new AuthRoute(),
  new ChatRoute(),
  new AppointmentRoute(),
]).listen(PORT as number, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Gracefully close the database connection when the server stops
const gracefulShutdown = async () => {
  console.log("Shutting down server...");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown); // Catch Ctrl+C
process.on("SIGTERM", gracefulShutdown); // Catch Docker/Hosting shutdown
