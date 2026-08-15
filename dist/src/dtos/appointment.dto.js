"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAppointmentSchema = void 0;
const zod_1 = require("zod");
exports.CreateAppointmentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    appointmentDate: zod_1.z
        .string()
        .datetime({ message: "Must be a valid ISO 8601 date string" }),
});
