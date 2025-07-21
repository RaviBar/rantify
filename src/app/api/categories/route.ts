import dbConnect from "@/lib/dbConnect";
import CategoryModel from "@/model/Category";

// GET: List all categories
export async function GET() {
  await dbConnect();
  const categories = await CategoryModel.find({});
  return Response.json({ success: true, categories });
}

// POST: Create a new category
export async function POST(request: Request) {
  await dbConnect();
  const { name, description } = await request.json();
  if (!name) {
    return Response.json({ success: false, message: "Name is required" }, { status: 400 });
  }
  const existing = await CategoryModel.findOne({ name });
  if (existing) {
    return Response.json({ success: false, message: "Category already exists" }, { status: 409 });
  }
  const category = await CategoryModel.create({ name, description });
  return Response.json({ success: true, category }, { status: 201 });
}