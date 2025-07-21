import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json({ success: false, message: "Not Authenticated" }, { status: 401 });
  }

  const foundUser = await UserModel.findById(user._id).select("messages");
  if (!foundUser) {
    return Response.json({ success: false, message: "User not found" }, { status: 404 });
  }

  return Response.json({
    success: true,
    messages: foundUser.messages || [],
  }, { status: 200 });
}