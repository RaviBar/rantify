import dbConnect from "@/lib/dbConnect";
import GroupModel from "@/model/Group";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { groupSchema } from "@/schemas/groupSchema";

export async function POST(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parse = groupSchema.safeParse(body);
  if (!parse.success) {
    return Response.json({ success: false, message: parse.error.errors[0].message }, { status: 400 });
  }
  const { name, description } = parse.data;

  const group = await GroupModel.create({
    name,
    description,
    members: [session.user._id],
  });

  return Response.json({ success: true, group }, { status: 201 });
}