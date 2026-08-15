import { Request, Response, NextFunction } from "express";
import { AuthService } from "@/services/auth.service";
import { SignupInput, LoginInput } from "@/dtos/auth.dto";

export class AuthController {
  private authService = new AuthService();

  public signup = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userData: SignupInput = req.body;
      const result = await this.authService.signup(userData);
      res.status(201).json({ message: "Signup successful", data: result });
    } catch (error) {
      next(error);
    }
  };

  public login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userData: LoginInput = req.body;
      const result = await this.authService.login(userData);
      res.status(200).json({ message: "Login successful", data: result });
    } catch (error) {
      next(error);
    }
  };
}
