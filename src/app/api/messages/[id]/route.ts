import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json({ success: false, message: "Not Authenticated" }, { status: 401 });
  }

  const foundUser = await UserModel.findById(user._id);
  if (!foundUser) {
    return Response.json({ success: false, message: "User not found" }, { status: 404 });
  }

  foundUser.messages = foundUser.messages.filter((msg: any) => msg._id.toString() !== params.id);
  await foundUser.save();

  return Response.json({ success: true, message: "Message deleted" }, { status: 200 });
}