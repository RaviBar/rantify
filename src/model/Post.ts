import mongoose, { Schema, Document } from "mongoose";

export interface Post extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  mediaUrl?: string;
  category: string;
  createdAt: Date;
  votes: number;
  comments: mongoose.Types.ObjectId[];
}

const PostSchema = new Schema<Post>({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  mediaUrl: String,
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  votes: { type: Number, default: 0 },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }]
});

export default mongoose.models.Post || mongoose.model<Post>("Post", PostSchema);