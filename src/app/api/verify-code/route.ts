import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();
  
  try {
    const { username, code } = await request.json();
    console.log("Received payload:", { username, code }); 
    const decodedUsername = decodeURIComponent(username);
    console.log("Decoded username:", decodedUsername);
    const user = await UserModel.findOne({ username: decodedUsername });
    console.log("User fetched from DB:", user);
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 500 }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
    console.log("Verification code from DB:", user.verifyCode);
    console.log("Verification code expiry:", user.verifyCodeExpiry);

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "Account Verified Successfully.",
        },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code has expired, please sign up again and to get a new code.",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Incorrect Verification code.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying username.", error);
    return Response.json(
      {
        success: false,
        message: "Error verifying username.",
      },
      { status: 500 }
    );
  }
}
