"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function FeedbackPage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/posts?category=feedback").then(res => setPosts(res.data.posts));
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Product Feedback & Reviews</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="bg-white rounded shadow p-4">
            <p className="my-2">{post.content}</p>
            <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}