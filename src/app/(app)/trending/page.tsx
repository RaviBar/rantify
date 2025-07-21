"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function TrendingPage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/posts?sort=trending").then(res => setPosts(res.data.posts));
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Trending Rants</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="bg-white rounded shadow p-4">
            <div className="flex justify-between items-center">
              <span className="text-blue-700 font-semibold">{post.category}</span>
              <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</span>
            </div>
            <p className="my-2">{post.content}</p>
            <Link href={`/post/${post._id}`} className="text-blue-600 hover:underline text-sm">View Thread</Link>
          </div>
        ))}
      </div>
    </div>
  );
}