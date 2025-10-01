// app/api/posts/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import cloudinary from "@/lib/cloudinary";
import dbConnect from "@/lib/dbConnect";
import PostModel from "@/model/Post";
import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import type { PostLean } from "@/types/post-lean";

// ---------- GET: list posts ----------
export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const sort = (searchParams.get("sort") ?? "recent").toLowerCase();
    const limitRaw = Number(searchParams.get("limit") ?? 20);
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 100)) : 20;
    const pageRaw = Number(searchParams.get("page") ?? 1);
    const page = Number.isFinite(pageRaw) ? Math.max(1, pageRaw) : 1;

    // Build sortSpec incrementally to avoid union-with-optional-key type errors
    const sortSpec: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "trending") {
      sortSpec.votes = -1;
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      PostModel.find({})
        .sort(sortSpec)
        .skip(skip)
        .limit(limit)
        .populate({ path: "author", select: "username" })
        .lean<PostLean[]>(),
      PostModel.countDocuments({}),
    ]);

    const normalized = posts.map((p) => ({
      _id: String(p._id),    
      content: p.content,
      category: p.category,
      mediaUrl: p.mediaUrl,
      author:
        typeof p.author === "object" && p.author && "username" in p.author
          ? { username: p.author.username }
          : { username: "unknown" },
      createdAt: p.createdAt,
      votes: p.votes ?? 0,
      // omit comments on list for payload size
    }));

    return NextResponse.json({ posts: normalized, page, limit, total }, { status: 200 });
  } catch (err) {
    console.error("GET /api/posts error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ---------- POST: create post ----------
type UploadRes = { secure_url: string; public_id: string };

async function uploadToCloudinary(file: File): Promise<UploadRes> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise<UploadRes>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "posts", resource_type: "image" },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) return reject(error ?? new Error("No result from Cloudinary"));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const authorId = (session as any)?.user?._id;
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const content = String(formData.get("content") ?? "");
    const category = String(formData.get("category") ?? "");
    const media = formData.get("media");

    if (!content || !category)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    let mediaUrl: string | undefined;
    if (media && typeof media !== "string") {
      const file = media as File;
      if (file.size > 0) {
        const max = 5 * 1024 * 1024;
        const type = file.type ?? "";
        if (!type.startsWith("image/"))
          return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        if (file.size > max) return NextResponse.json({ error: "File too large" }, { status: 413 });
        const { secure_url } = await uploadToCloudinary(file);
        mediaUrl = secure_url;
      }
    }

    const doc = await PostModel.create({
      author: authorId,
      content,
      category,
      mediaUrl,
    });

    return NextResponse.json(
      { success: true, post: { id: String(doc._id), content, category, mediaUrl } },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/posts error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
