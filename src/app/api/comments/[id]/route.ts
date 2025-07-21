import dbConnect from "@/lib/dbConnect";
import CommentModel from "@/model/Comment";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const { content } = await request.json();
  if (!content) {
    return Response.json({ success: false, message: "Content required" }, { status: 400 });
  }

  const comment = await CommentModel.findById(params.id);
  if (!comment) {
    return Response.json({ success: false, message: "Comment not found" }, { status: 404 });
  }
  if (comment.author.toString() !== session.user._id) {
    return Response.json({ success: false, message: "Not authorized" }, { status: 403 });
  }

  comment.content = content;
  await comment.save();

  return Response.json({ success: true, comment });
}