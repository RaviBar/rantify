import { z } from "zod";

export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(2, "Username must be at least 2 characters")
      .max(20, "Username must be no more than 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters"),
    email: z.string().email("Invalid email address").optional().or(z.literal('')), // Made email optional and allow empty string
    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  });