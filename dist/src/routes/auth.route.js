"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoute = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_dto_1 = require("../dtos/auth.dto");
class AuthRoute {
    path = "/api/auth";
    router = (0, express_1.Router)();
    authController = new auth_controller_1.AuthController();
    constructor() {
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/signup`, (0, validation_middleware_1.validationMiddleware)(auth_dto_1.SignupDto), this.authController.signup);
        this.router.post(`${this.path}/login`, (0, validation_middleware_1.validationMiddleware)(auth_dto_1.LoginDto), this.authController.login);
    }
}
exports.AuthRoute = AuthRoute;
