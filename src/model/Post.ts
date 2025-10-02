import mongoose, { Schema, Model, Types } from "mongoose";

export interface Post {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  title: string; // Added title
  content: string;
  mediaUrl?: string;
  category: string;
  votes: number;
  comments: Types.ObjectId[]; // refs Comment
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<Post>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true }, // Added title
    content: { type: String, required: true },
    mediaUrl: String,
    category: { type: String, required: true },
    votes: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true } // provides createdAt/updatedAt
);

const PostModel: Model<Post> =
  (mongoose.models.Post as Model<Post>) || mongoose.model<Post>("Post", PostSchema);

export default PostModel;