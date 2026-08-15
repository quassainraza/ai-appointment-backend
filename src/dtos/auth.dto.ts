import { z } from "zod";

export const SignupDto = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof SignupDto>;
export type LoginInput = z.infer<typeof LoginDto>;
