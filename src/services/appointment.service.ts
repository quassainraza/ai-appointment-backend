import { prisma } from "@/supabase";
import { CreateAppointmentInput } from "@/dtos/appointment.dto";

export class AppointmentService {
  public async createAppointment(userId: string, data: CreateAppointmentInput) {
    const appointment = await prisma.appointment.create({
      data: {
        user_id: userId,
        title: data.title,
        appointment_date: new Date(data.appointmentDate),
        status: "confirmed",
      },
    });
    return appointment;
  }

  public async getUserAppointments(userId: string) {
    const appointments = await prisma.appointment.findMany({
      where: { user_id: userId },
      orderBy: { appointment_date: "asc" },
    });
    return appointments;
  }
}
