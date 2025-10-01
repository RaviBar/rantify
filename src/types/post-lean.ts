import { Types } from "mongoose";

export type UsernameOnly = { username: string };
export type MaybeUser = Types.ObjectId | UsernameOnly;

export type CommentLean = {
  _id: Types.ObjectId;
  content: string;
  createdAt: Date;
  author: MaybeUser;
};

export type PostLean = {
  _id: Types.ObjectId;
  author: MaybeUser;
  content: string;
  mediaUrl?: string;
  category: string;
  createdAt: Date;
  votes: number;
  comments: CommentLean[];
};