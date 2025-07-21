import mongoose, { Schema, Document } from "mongoose";

export interface Group extends Document {
  name: string;
  description?: string;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const GroupSchema = new Schema<Group>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Group || mongoose.model<Group>("Group", GroupSchema);