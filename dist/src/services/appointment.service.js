"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const supabase_1 = require("../supabase");
class AppointmentService {
    async createAppointment(userId, data) {
        const appointment = await supabase_1.prisma.appointment.create({
            data: {
                user_id: userId,
                title: data.title,
                appointment_date: new Date(data.appointmentDate),
                status: "confirmed",
            },
        });
        return appointment;
    }
    async getUserAppointments(userId) {
        const appointments = await supabase_1.prisma.appointment.findMany({
            where: { user_id: userId },
            orderBy: { appointment_date: "asc" },
        });
        return appointments;
    }
}
exports.AppointmentService = AppointmentService;
