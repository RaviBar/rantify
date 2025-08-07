import dbConnect from "@/lib/dbConnect";
import PostModel from "@/model/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { SortOrder } from "mongoose"; // Import SortOrder for better type safety

// GET: List all posts (optionally filter by category, sort by trending/recent)
export async function GET(request: Request) {
  await dbConnect();
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const sortBy = url.searchParams.get("sort"); // 'trending', 'createdAt'
  const limit = url.searchParams.get("limit"); // for recent posts, e.g., limit=5

  let filter: any = {};
  if (category) {
    filter.category = category;
  }

  let sortOptions: { [key: string]: SortOrder } = { createdAt: -1 }; // Default to recent
  if (sortBy === "trending") {
    sortOptions = { votes: -1, createdAt: -1 }; // Sort by votes, then recency
  } else if (sortBy === "createdAt") {
    sortOptions = { createdAt: -1 };
  }

  try {
    const posts = await PostModel.find(filter)
      .sort(sortOptions)
      .limit(limit ? parseInt(limit as string) : 0) // Apply limit if present
      .populate("author", "username"); // Populate only the username for anonymity
    return Response.json({ success: true, posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return Response.json({ success: false, message: "Failed to fetch posts." }, { status: 500 });
  }
}

// POST: Create a new post (remains the same)
export async function POST(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  // Ensure that _id is properly extracted from session.user
  const authorId = session.user._id; 
  if (!authorId) {
    return Response.json({ success: false, message: "User ID not found in session." }, { status: 500 });
  }

  const { content, category, mediaUrl } = await request.json(); // mediaUrl is now supported
  if (!content || !category) {
    return Response.json({ success: false, message: "Missing fields" }, { status: 400 });
  }

  try {
    const post = await PostModel.create({
      author: authorId, // Use the extracted authorId
      content,
      category,
      mediaUrl, // Pass mediaUrl to the model
    });

    return Response.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return Response.json({ success: false, message: "Failed to create post." }, { status: 500 });
  }
}