import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { SendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();
  console.log("Database connected successfully");

  try {
    const body = await request.json();
    console.log("Request Body:", body);
    const { username, email, password } = body;
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Username is already taken.",
        })
        ,
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "User already exist with this email.",
          })
          ,
          { status: 400 }
        );
      } else {
        const hasedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hasedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } if(!existingUserByEmail) {
      const hasedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hasedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptMessage: true,
        messages: [],
      });
      try {
        const savedUser = await newUser.save();
        console.log("Saved User:", savedUser);
    } catch (error) {
        console.error("Error saving user:", error);
    }
    }

    // send verification email

    const emailResponse = await SendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: emailResponse.message,
        })
        ,
        { status: 500 }
      );
    }
    const response = new Response(
      JSON.stringify({
        success: true,
        message: "User registered successfully. Please verify your email",
      })
      ,
      { status: 201,
        headers: { "Content-Type": "application/json" },
       }
    );
    console.log("Response to be sent:", response);
    return response;
  } catch (error) {
    console.log("Error registering user", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error registering user",
      })
      ,
      {
        status: 500,
      }
    );
  }
}
