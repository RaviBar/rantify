'use client';
import React from 'react';
import Link from 'next/link';

interface SidebarLeftProps { categories: string[]; }
export function SidebarLeft({ categories }: SidebarLeftProps) {
  return (
    <aside className="w-60 p-4 sticky top-8">
      <h2 className="text-lg font-semibold mb-4">Sub-Rants</h2>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat}>
            <Link href={`/category/${cat.toLowerCase()}`}
            className="block px-3 py-1 rounded hover:bg-gray-100">
              {cat}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}