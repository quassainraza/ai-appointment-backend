import { Router } from "express";
import { IRoute } from "@/interfaces/route.interface";
import { AuthController } from "@/controllers/auth.controller";
import { validationMiddleware } from "@/middlewares/validation.middleware";
import { LoginDto, SignupDto } from "@/dtos/auth.dto";

export class AuthRoute implements IRoute {
  public path = "/api/auth";
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}/signup`,
      validationMiddleware(SignupDto),
      this.authController.signup,
    );

    this.router.post(
      `${this.path}/login`,
      validationMiddleware(LoginDto),
      this.authController.login,
    );
  }
}
