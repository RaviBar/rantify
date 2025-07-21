import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json({ success: false, message: "Username and password are required." }, { status: 400 });
    }

    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return Response.json({ success: false, message: "Username already taken." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      username,
      password: hashedPassword,
    });

    return Response.json({ success: true, message: "Sign up successful!" }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, message: "Server error." }, { status: 500 });
  }
}