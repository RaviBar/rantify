import mongoose, { Schema, Document } from "mongoose";

// Define the structure for a Message
export interface Message extends Document {
  content: string;
  createdAt: Date;
}

// Define the schema for Message
const MessageSchema: Schema<Message> = new Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Define the structure for a User
export interface User extends Document {
  username: string;
  password: string;
  email?: string; // Made email optional
  verifyCode?: string; // Verification code for signup
  verifyCodeExpiry?: Date; // Expiry for verification code
  isVerified: boolean; // Has the user verified their account
  isAcceptingMessages: boolean; // Whether the user accepts anonymous DMs
  messages: Message[]; // Array of received messages
  createdAt: Date;
}

// Define the schema for User
const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required!"],
    trim: true,
    unique: true,
    immutable: true, // As per your requirement
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
  },
  email: { // Email is now optional, so 'required' is removed. 'unique' constraint should be conditional or handled carefully.
    type: String,
    unique: false, // Set to false, uniqueness will be handled conditionally in signup route
    sparse: true, // Allows multiple documents to have a null/missing email without violating unique index
  },
  verifyCode: String,
  verifyCodeExpiry: Date,
  isVerified: {
    type: Boolean,
    default: false, // Default to false, will be set to true if no email is provided
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true, // Default to accepting messages
  },
  messages: [MessageSchema], // Embed MessageSchema
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;