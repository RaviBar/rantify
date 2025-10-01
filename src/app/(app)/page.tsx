"use client"
import Link from "next/link";
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { SidebarLeft } from '@/components/SidebarLeft'; 
import { Feed } from '@/components/Feed'; 
import { Button } from "@/components/ui/button"; 

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); 
  const [recent, setRecent] = useState<{ _id: string; content: string }[]>([]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, categoriesRes, recentRes] = await Promise.all([
          axios.get("/api/posts?sort=trending"),
          axios.get("/api/categories"),
          axios.get('/api/posts?sort=createdAt&limit=5') 
        ]);
        setPosts(postsRes.data.posts || []);
        setCategories(categoriesRes.data.categories || []);
        setRecent(recentRes.data.posts.map((p: any) => ({ _id: p._id, content: p.content.slice(0, 50) + '...' })) || []); 
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col">
      <div className="flex flex-1 max-w-7xl mx-auto w-full pt-8 gap-8 px-4">
        {/* Left Sidebar for Categories */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-4 sticky top-24"> {/* Adjusted sticky top */}
            <h2 className="text-lg font-bold mb-4 text-blue-700">Categories</h2>
            <ul className="space-y-2">
              {categories.map((cat: any) => (
                <li key={cat._id}> {/* Use cat._id if available for unique key */}
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
                <Button className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">
                  Product Feedback
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 min-w-0"> {/* min-w-0 to prevent overflow */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-3xl font-extrabold text-blue-700 mb-2">Rantify</h1>
            <p className="text-gray-700 mb-4">
              Welcome to <span className="font-bold">Rantify</span> — the anonymous, privacy-first social platform for open discussion, feedback, and whistleblowing. Join trending conversations, post honest reviews, or start a group chat—completely anonymously.
            </p>
            <div className="flex gap-4">
              <Link href="/sign-up">
                <Button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold">
                  Get Started
                </Button>
              </Link>
              <Link href="/trending">
                <Button variant="outline" className="bg-gray-200 text-blue-700 px-6 py-2 rounded hover:bg-gray-300 transition font-semibold">
                  Explore Trending
                </Button>
              </Link>
            </div>
          </div>

          {/* Trending Feed Component */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Trending Rants</h2>
            {posts.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No trending posts yet.</div>
            ) : (
              <Feed posts={posts} />
            )}
          </div>
        </section>

        {/* Right Sidebar for Recent/Popular */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-4 sticky top-24"> 
            <h2 className="text-lg font-bold mb-4 text-blue-700">Recent & Popular</h2>
            <ul className="space-y-2">
              {recent.map((item) => (
                <li key={item._id}>
                  <Link href={`/post/${item._id}`} className="block px-3 py-1 rounded hover:bg-gray-100 text-gray-700">
                    {item.content}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}