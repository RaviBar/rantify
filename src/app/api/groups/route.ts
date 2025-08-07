import dbConnect from "@/lib/dbConnect";
import GroupModel from "@/model/Group";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { groupSchema } from "@/schemas/groupSchema";

// GET: List all groups
export async function GET() {
  await dbConnect();
  try {
    const groups = await GroupModel.find({}).select("name description");
    return Response.json({ success: true, groups });
  } catch (error) {
    return Response.json({ success: false, message: "Failed to fetch groups" }, { status: 500 });
  }
}

// POST: Create a new group
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

  // Check if group already exists
  const existingGroup = await GroupModel.findOne({ name });
  if (existingGroup) {
      return Response.json({ success: false, message: "A group with this name already exists." }, { status: 409 });
  }

  const group = await GroupModel.create({
    name,
    description,
    members: [session.user._id],
  });

  return Response.json({ success: true, group }, { status: 201 });
}