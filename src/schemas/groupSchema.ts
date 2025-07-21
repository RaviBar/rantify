import { z } from "zod";

export const groupSchema = z.object({
  name: z.string().min(3, "Group name required"),
  description: z.string().optional(),
});