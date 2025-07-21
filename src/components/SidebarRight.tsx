'use client';
import React from 'react';
import Link from 'next/link';

interface SidebarRightProps { recent: { id: string; title: string }[]; }
export function SidebarRight({ recent }: SidebarRightProps) {
  return (
    <aside className="w-80 p-4 sticky top-8">
      <h2 className="text-lg font-semibold mb-4">Recent & Popular</h2>
      <ul className="space-y-2">
        {recent.map(({ id, title }) => (
          <li key={id}>
            <Link href={`/post/${id}`}>
              <a className="block px-3 py-1 rounded hover:bg-gray-100">{title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}