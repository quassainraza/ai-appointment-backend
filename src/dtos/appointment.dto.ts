import { z } from "zod";

export const CreateAppointmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  appointmentDate: z
    .string()
    .datetime({ message: "Must be a valid ISO 8601 date string" }),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
