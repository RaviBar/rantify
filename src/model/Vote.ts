import mongoose, { Schema, Document } from "mongoose";

export interface Vote extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  value: number; // 1 for upvote, -1 for downvote
}

const VoteSchema = new Schema<Vote>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  value: { type: Number, enum: [1, -1], required: true }
});

export default mongoose.models.Vote || mongoose.model<Vote>("Vote", VoteSchema);