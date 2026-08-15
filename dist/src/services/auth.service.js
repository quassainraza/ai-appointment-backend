"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const supabase_1 = require("../supabase");
const HttpException_1 = require("../exceptions/HttpException");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    async signup(userData) {
        const existingUser = await supabase_1.prisma.user.findUnique({
            where: { email: userData.email },
        });
        if (existingUser)
            throw new HttpException_1.HttpException(409, "Email already exists");
        const hashedPassword = await bcrypt_1.default.hash(userData.password, 10);
        const user = await supabase_1.prisma.user.create({
            data: {
                email: userData.email,
                password_hash: hashedPassword,
                name: userData.name,
            },
        });
        return this.generateToken(user.id, user.email, user.name);
    }
    async login(userData) {
        const user = await supabase_1.prisma.user.findUnique({
            where: { email: userData.email },
        });
        if (!user)
            throw new HttpException_1.HttpException(401, "Invalid credentials");
        const isPasswordMatching = await bcrypt_1.default.compare(userData.password, user.password_hash);
        if (!isPasswordMatching)
            throw new HttpException_1.HttpException(401, "Invalid credentials");
        return this.generateToken(user.id, user.email, user.name);
    }
    generateToken(id, email, name) {
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error("JWT_SECRET is not configured");
        const token = jsonwebtoken_1.default.sign({ id, email, name }, secret, { expiresIn: "24h" });
        return { token, user: { id, email, name } };
    }
}
exports.AuthService = AuthService;
