export const dynamic = 'force-dynamic';  
export const revalidate = 0;    
export const runtime = 'nodejs';  
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Not Authenticated" }, { status: 401 });
    }

    // Prefer `id`; fall back to `_id` if you've extended the session that way
    const userId = (session.user as any).id || (session.user as any)._id;
    if (!userId) {
      return NextResponse.json({ success: false, message: "Invalid session user" }, { status: 400 });
    }

    // Use lean() so we get plain objects and then map to DTOs
    const foundUser = await UserModel.findById(userId).select("messages").lean();
    if (!foundUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const messages = (foundUser.messages ?? []).map((m: any) => ({
      _id: String(m._id),                          // <- stringify ObjectId
      content: m.content,
      createdAt: new Date(m.createdAt).toISOString(), // <- ISO string for client
    }));

    return NextResponse.json({ success: true, messages }, { status: 200 });
  } catch (err) {
    console.error("GET /api/messages error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
