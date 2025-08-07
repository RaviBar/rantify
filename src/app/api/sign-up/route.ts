import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import UserModel, { User } from "@/model/User";
import { SendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { signUpSchema } from "@/schemas/signUpSchema";
import mongoose from "mongoose";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    // Use the safeParse method for validation
    const result = signUpSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message);
      return Response.json(
        { success: false, message: errors.join(", ") },
        { status: 400 }
      );
    }

    const { username, email, password } = result.data; // email can now be undefined or empty string

    // Check if username already exists
    const existingUserByUsername = await UserModel.findOne({ username });

    if (existingUserByUsername) {
      // If username exists and is verified, deny registration
      if (existingUserByUsername.isVerified) {
        return Response.json(
          {
            success: false,
            message: "Username is already taken and verified.",
          },
          { status: 409 }
        );
      } else {
        // If username exists but not verified, allow to overwrite or re-send code
        // This path is for users trying to re-register with an unverified username
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByUsername.password = hashedPassword; // Update password if re-registering

        if (email) {
          // If a new email is provided or existing unverified user now provides email
          const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
          const verifyCodeExpiry = new Date();
          verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1);

          existingUserByUsername.email = email;
          existingUserByUsername.verifyCode = verifyCode;
          existingUserByUsername.verifyCodeExpiry = verifyCodeExpiry;
          existingUserByUsername.isVerified = false; // Must be unverified if email verification is initiated

          await existingUserByUsername.save();

          const emailResponse = await SendVerificationEmail(
            email,
            username,
            verifyCode
          );
          if (!emailResponse.success) {
            return Response.json(
              {
                success: false,
                message: emailResponse.message || "Failed to send verification email.",
              },
              { status: 500 }
            );
          }
          return Response.json(
            {
              success: true,
              message:
                "Username exists but not verified. A new verification code has been sent to your email.",
            },
            { status: 200 }
          );
        } else {
          // If username exists, not verified, and no email provided (or removed)
          // Treat as a direct registration without email
          existingUserByUsername.email = undefined; // Ensure email is removed if not provided
          existingUserByUsername.verifyCode = undefined;
          existingUserByUsername.verifyCodeExpiry = undefined;
          existingUserByUsername.isVerified = true; // Instantly verified if no email
          await existingUserByUsername.save();
          return Response.json(
            {
              success: true,
              message:
                "Username registered successfully without email. You are now verified.",
            },
            { status: 200 }
          );
        }
      }
    }

    // Handle new user creation
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserFields: Partial<User> = {
      username,
      password: hashedPassword,
      isAcceptingMessages: true, // Default to true
      messages: [], // Initialize messages array
    };

    if (email) {
      // If email is provided, proceed with verification
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verifyCodeExpiry = new Date();
      verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1);

      newUserFields.email = email;
      newUserFields.verifyCode = verifyCode;
      newUserFields.verifyCodeExpiry = verifyCodeExpiry;
      newUserFields.isVerified = false; // Not verified until email confirmed

      const newUser = await UserModel.create(newUserFields);

      const emailResponse = await SendVerificationEmail(
        email,
        username,
        verifyCode
      );
      if (!emailResponse.success) {
        // If email sending fails, consider if you want to delete the user or mark them for manual review
        // For now, we'll return an error.
        await UserModel.deleteOne({ _id: newUser._id }); // Rollback user creation
        return Response.json(
          {
            success: false,
            message: emailResponse.message || "Failed to send verification email. User not created.",
          },
          { status: 500 }
        );
      }

      return Response.json(
        {
          success: true,
          message:
            "User registered successfully. Please verify your account with the code sent to your email.",
        },
        { status: 201 }
      );
    } else {
      // If no email is provided, instantly verify the user
      newUserFields.isVerified = true;
      const newUser = await UserModel.create(newUserFields);

      return Response.json(
        {
          success: true,
          message:
            "User registered successfully without email. You can now log in.",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error during sign-up:", error);
    // Check for duplicate email error specifically if you re-add unique:true for email
    if ((error as any).code === 11000) {
      // This part is less likely to hit if email is not unique, but good to keep
      return Response.json(
        { success: false, message: "Email already registered." },
        { status: 409 }
      );
    }
    return Response.json(
      { success: false, message: "Server error during sign-up." },
      { status: 500 }
    );
  }
}