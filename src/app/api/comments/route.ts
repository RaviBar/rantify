import dbConnect from "@/lib/dbConnect";
import CommentModel from "@/model/Comment";
import PostModel from "@/model/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { commentSchema } from "@/schemas/commentSchema";

export async function POST(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parse = commentSchema.safeParse(body);
  if (!parse.success) {
    return Response.json({ success: false, message: parse.error.errors[0].message }, { status: 400 });
  }
  const { postId, content } = parse.data;

  const comment = await CommentModel.create({
    post: postId,
    author: session.user._id,
    content,
  });

  await PostModel.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

  return Response.json({ success: true, comment }, { status: 201 });
}