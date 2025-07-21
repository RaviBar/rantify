import dbConnect from "@/lib/dbConnect";
import PostModel from "@/model/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

// GET: Get a single post by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const post = await PostModel.findById(params.id).populate("author", "username");
  if (!post) {
    return Response.json({ success: false, message: "Post not found" }, { status: 404 });
  }
  return Response.json({ success: true, post });
}

// DELETE: Delete a post (only by author)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const post = await PostModel.findById(params.id);
  if (!post) {
    return Response.json({ success: false, message: "Post not found" }, { status: 404 });
  }
  if (post.author.toString() !== session.user._id) {
    return Response.json({ success: false, message: "Not authorized" }, { status: 403 });
  }
  await post.deleteOne();
  return Response.json({ success: true, message: "Post deleted" });
}