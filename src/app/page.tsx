"use client";
import Link from "next/link";
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { SidebarLeft } from '../components/SidebarLeft';
import { Feed } from '../components/Feed';
import { SidebarRight } from '../components/SidebarRight';

  
export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [recent, setRecent] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    axios.get("/api/posts?sort=trending").then(res => setPosts(res.data.posts));
    axios.get("/api/categories").then(res => setCategories(res.data.categories));
    axios.get('/api/posts?sort=recent&limit=5').then(res => setRecent(res.data.posts.map((p: any) => ({ id: p._id, title: p.content.slice(0, 50) + '...' }))));
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col">
      {/* Navbar is already included globally */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full pt-8 gap-8">
        {/* Sidebar */}
        {/* <SidebarLeft categories={categories} /> */}
        {/* <Feed posts={posts} /> */}
        <aside className="hidden lg:block w-64">
          <div className="bg-white rounded-lg shadow p-4 sticky top-24">
            <h2 className="text-lg font-bold mb-4 text-blue-700">Categories</h2>
            <ul className="space-y-2">
              {categories.map((cat: any) => (
                <li key={cat._id}>
                  <Link
                    href={`/trending?category=${cat.name}`}
                    className="block px-2 py-1 rounded hover:bg-blue-50 text-gray-700 font-medium"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link href="/feedback">
                <button className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">
                  Product Feedback
                </button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <section className="flex-1">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-3xl font-extrabold text-blue-700 mb-2">Rantify</h1>
            <p className="text-gray-700 mb-4">
              Welcome to <span className="font-bold">Rantify</span> — the anonymous, privacy-first social platform for open discussion, feedback, and whistleblowing. Join trending conversations, post honest reviews, or start a group chat—completely anonymously.
            </p>
            <div className="flex gap-4">
              <Link href="/sign-up">
                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold">
                  Get Started
                </button>
              </Link>
              <Link href="/trending">
                <button className="bg-gray-200 text-blue-700 px-6 py-2 rounded hover:bg-gray-300 transition font-semibold">
                  Explore Trending
                </button>
              </Link>
            </div>
          </div>

          {/* Trending Feed */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Trending Rants</h2>
            {posts.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No trending posts yet.</div>
            ) : (
              <ul className="space-y-4">
                {posts.map((post: any) => (
                  <li key={post._id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{post.category}</span>
                      <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                    <Link href={`/post/${post._id}`}>
                      <p className="font-medium text-gray-900 hover:text-blue-700 transition cursor-pointer mb-1">
                        {post.content.length > 120 ? post.content.slice(0, 120) + "..." : post.content}
                      </p>
                    </Link>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>▲ {post.votes || 0} votes</span>
                      <span>{post.comments?.length || 0} comments</span>
                      <span>by {post.author?.username || "anon"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <SidebarRight recent={recent} />
      </div>
    </main>
  );
}