"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
const auth_route_1 = require("./routes/auth.route");
const supabase_1 = require("./supabase");
const chat_route_1 = require("./routes/chat.route");
const appointment_route_1 = require("./routes/appointment.route");
const PORT = process.env.PORT || 3000;
dotenv_1.default.config();
const app = new app_1.App([
    new auth_route_1.AuthRoute(),
    new chat_route_1.ChatRoute(),
    new appointment_route_1.AppointmentRoute(),
]).listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Gracefully close the database connection when the server stops
const gracefulShutdown = async () => {
    console.log("Shutting down server...");
    await supabase_1.prisma.$disconnect();
    process.exit(0);
};
process.on("SIGINT", gracefulShutdown); // Catch Ctrl+C
process.on("SIGTERM", gracefulShutdown); // Catch Docker/Hosting shutdown
