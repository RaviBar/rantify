import dbConnect from "@/lib/dbConnect";
import PostModel from "@/model/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

// GET: List all posts (optionally filter by category)
export async function GET(request: Request) {
  await dbConnect();
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const filter = category ? { category } : {};
  const posts = await PostModel.find(filter).sort({ createdAt: -1 }).populate("author", "username");
  return Response.json({ success: true, posts });
}

// POST: Create a new post
export async function POST(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const { content, category, mediaUrl } = await request.json();
  if (!content || !category) {
    return Response.json({ success: false, message: "Missing fields" }, { status: 400 });
  }

  const post = await PostModel.create({
    author: session.user._id,
    content,
    category,
    mediaUrl,
  });

  return Response.json({ success: true, post }, { status: 201 });
}