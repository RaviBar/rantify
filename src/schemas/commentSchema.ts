import { z } from "zod";

export const commentSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  content: z.string().min(1, "Comment cannot be empty"),
});