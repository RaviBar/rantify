import mongoose, { Schema, Document } from "mongoose";

export interface Category extends Document {
  name: string;
  description?: string;
}

const CategorySchema = new Schema<Category>({
  name: { type: String, required: true, unique: true },
  description: { type: String }
});

export default mongoose.models.Category || mongoose.model<Category>("Category", CategorySchema);