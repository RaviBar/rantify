import dbConnect from "@/lib/dbConnect";
import CategoryModel from "@/model/Category";
import { NextResponse } from "next/server";

// GET: List all categories
export async function GET() {
  await dbConnect();
  try {
    const categories = await CategoryModel.find({});
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST: Create a new category
export async function POST(request: Request) {
  await dbConnect();
  try {
    const { name, description } = await request.json();
    if (!name) {
      return Response.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }
    const existing = await CategoryModel.findOne({ name });
    if (existing) {
      return Response.json(
        { success: false, message: "Category already exists" },
        { status: 409 }
      );
    }
    const category = await CategoryModel.create({ name, description });
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 }
    );
  }
}