export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PostModel from "@/model/Post";
import CommentModel from "@/model/Comment"; // Import the Comment model
import type { PostLean } from "@/types/post-lean";
import { isValidObjectId } from "mongoose";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const id = params?.id;
    if (!id || id === "undefined" || !isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const post = await PostModel.findById(id)
      .populate({ path: "author", select: "username" })
      .populate({
        path: "comments",
        model: CommentModel, // Explicitly provide the model for population
        select: "content author createdAt",
        populate: { path: "author", select: "username" },
      })
      .lean<PostLean | null>();

    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const normalized = {
      _id: String(post._id),
      content: post.content,
      category: post.category,
      mediaUrl: post.mediaUrl,
      author:
        typeof post.author === "object" && post.author && "username" in post.author
          ? { username: post.author.username }
          : { username: "unknown" },
      createdAt: post.createdAt,
      votes: post.votes ?? 0,
      comments: (post.comments ?? []).map((c) => ({
        _id: String(c._id),
        content: c.content,
        author:
          typeof c.author === "object" && c.author && "username" in c.author
            ? { username: c.author.username }
            : { username: "unknown" },
        createdAt: c.createdAt,
      })),
    };

    return NextResponse.json({ post: normalized }, { status: 200 });
  } catch (err) {
    console.error("GET /api/posts/[id] error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}