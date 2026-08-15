import { Response, NextFunction } from "express";
import { AppointmentService } from "@/services/appointment.service";
import { CreateAppointmentInput } from "@/dtos/appointment.dto";
import { RequestWithUser } from "@/middlewares/auth.middleware";

export class AppointmentController {
  private appointmentService = new AppointmentService();

  public create = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const appointmentData: CreateAppointmentInput = req.body;

      const result = await this.appointmentService.createAppointment(
        userId,
        appointmentData,
      );
      res
        .status(201)
        .json({ message: "Appointment created successfully", data: result });
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await this.appointmentService.getUserAppointments(userId); // to get all appointments for the user
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  };
}
