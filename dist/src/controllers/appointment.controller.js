"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const appointment_service_1 = require("../services/appointment.service");
class AppointmentController {
    appointmentService = new appointment_service_1.AppointmentService();
    create = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const appointmentData = req.body;
            const result = await this.appointmentService.createAppointment(userId, appointmentData);
            res
                .status(201)
                .json({ message: "Appointment created successfully", data: result });
        }
        catch (error) {
            next(error);
        }
    };
    getAll = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const result = await this.appointmentService.getUserAppointments(userId); // to get all appointments for the user
            res.status(200).json({ data: result });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AppointmentController = AppointmentController;
