import mongoose, { Schema, Document } from "mongoose";

export interface Comment extends Document {
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  votes: number;
}

const CommentSchema = new Schema<Comment>({
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  votes: { type: Number, default: 0 }
});

export default mongoose.models.Comment || mongoose.model<Comment>("Comment", CommentSchema);