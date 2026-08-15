import { prisma } from "@/supabase";
import { HttpException } from "@/exceptions/HttpException";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginInput, SignupInput } from "@/dtos/auth.dto";

export class AuthService {
  public async signup(userData: SignupInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (existingUser) throw new HttpException(409, "Email already exists");

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password_hash: hashedPassword,
        name: userData.name,
      },
    });

    return this.generateToken(user.id, user.email, user.name);
  }

  public async login(userData: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (!user) throw new HttpException(401, "Invalid credentials");

    const isPasswordMatching = await bcrypt.compare(
      userData.password,
      user.password_hash,
    );
    if (!isPasswordMatching)
      throw new HttpException(401, "Invalid credentials");

    return this.generateToken(user.id, user.email, user.name);
  }

  private generateToken(id: string, email: string, name: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not configured");

    const token = jwt.sign({ id, email, name }, secret, { expiresIn: "24h" });
    return { token, user: { id, email, name } };
  }
}
