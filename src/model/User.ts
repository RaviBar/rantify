
import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  username: string;
  password: string;
  createdAt: Date;
}

const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "UserName is required!"],
    trim: true,
    unique: true,
    immutable: true,
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;