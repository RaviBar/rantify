'use client';
import React from 'react';
import PostCard from './PostCard';

interface FeedProps { posts: any[]; }
export function Feed({ posts }: FeedProps) {
  return (
    <main className="flex-1 p-4">
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </main>
  );
}