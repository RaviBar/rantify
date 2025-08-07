"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Feed } from "@/components/Feed"; // Use Feed component for consistent display

export default function TrendingPage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/posts?sort=trending").then(res => setPosts(res.data.posts)); // Use sort=trending
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Trending Rants</h1>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No trending posts yet.</div>
        ) : (
          <Feed posts={posts} />
        )}
      </div>
    </div>
  );
}