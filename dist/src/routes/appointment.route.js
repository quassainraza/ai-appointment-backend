"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentRoute = void 0;
const express_1 = require("express");
const appointment_controller_1 = require("../controllers/appointment.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const appointment_dto_1 = require("../dtos/appointment.dto");
class AppointmentRoute {
    path = "/api/appointments";
    router = (0, express_1.Router)();
    appointmentController = new appointment_controller_1.AppointmentController();
    constructor() {
        this.initializeRoutes();
    }
    initializeRoutes() {
        // both routes are protected by authMiddleware and validated by validationMiddleware
        this.router.post(`${this.path}`, auth_middleware_1.authMiddleware, (0, validation_middleware_1.validationMiddleware)(appointment_dto_1.CreateAppointmentSchema), this.appointmentController.create);
        this.router.get(`${this.path}`, auth_middleware_1.authMiddleware, this.appointmentController.getAll);
    }
}
exports.AppointmentRoute = AppointmentRoute;
