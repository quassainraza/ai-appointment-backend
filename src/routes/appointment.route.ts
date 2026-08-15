import { Router } from "express";
import { IRoute } from "@/interfaces/route.interface";
import { AppointmentController } from "@/controllers/appointment.controller";
import { validationMiddleware } from "@/middlewares/validation.middleware";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { CreateAppointmentSchema } from "@/dtos/appointment.dto";

export class AppointmentRoute implements IRoute {
  public path = "/api/appointments";
  public router = Router();
  public appointmentController = new AppointmentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // both routes are protected by authMiddleware and validated by validationMiddleware
    this.router.post(
      `${this.path}`,
      authMiddleware,
      validationMiddleware(CreateAppointmentSchema),
      this.appointmentController.create,
    );

    this.router.get(
      `${this.path}`,
      authMiddleware,
      this.appointmentController.getAll,
    );
  }
}
