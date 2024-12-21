import { z } from "zod";

export const userNameValidation = z
  .string()
  .min(3, "User Name must be atleast 3 characters")
  .max(20, "User Name must be no more than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special character");

export const signUpSchema = z.object({
  username: userNameValidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "password must be at least 6 character" }),
});
