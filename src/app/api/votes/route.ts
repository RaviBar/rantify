import dbConnect from "@/lib/dbConnect";
import VoteModel from "@/model/Vote";
import PostModel from "@/model/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";

// POST: Upvote or downvote a post
export async function POST(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  const { postId, value } = await request.json(); // value: 1 or -1
  if (!postId || ![1, -1].includes(value)) {
    return Response.json({ success: false, message: "Invalid vote" }, { status: 400 });
  }

  // Prevent double voting
  const existing = await VoteModel.findOne({ user: session.user._id, post: postId });
  if (existing) {
    if (existing.value === value) {
      return Response.json({ success: false, message: "Already voted" }, { status: 409 });
    }
    existing.value = value;
    await existing.save();
  } else {
    await VoteModel.create({ user: session.user._id, post: postId, value });
  }

  // Update post vote count
  const votes = await VoteModel.aggregate([
    { $match: { post: new mongoose.Types.ObjectId(postId) } },
    { $group: { _id: "$post", total: { $sum: "$value" } } }
  ]);
  const totalVotes = votes[0]?.total || 0;
  await PostModel.findByIdAndUpdate(postId, { votes: totalVotes });

  return Response.json({ success: true, votes: totalVotes });
}