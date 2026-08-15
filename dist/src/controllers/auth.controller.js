"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    authService = new auth_service_1.AuthService();
    signup = async (req, res, next) => {
        try {
            const userData = req.body;
            const result = await this.authService.signup(userData);
            res.status(201).json({ message: "Signup successful", data: result });
        }
        catch (error) {
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            const userData = req.body;
            const result = await this.authService.login(userData);
            res.status(200).json({ message: "Login successful", data: result });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuthController = AuthController;
