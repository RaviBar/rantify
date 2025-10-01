'use client';
import React from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

interface SidebarDrawerProps {
  open: boolean;
  onClose: () => void;
  username?: string;
}

export function SidebarDrawer({ open, onClose, username }: SidebarDrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="ml-auto w-64 bg-white shadow-lg h-full p-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X size={24} />
        </button>
        <nav className="mt-8 space-y-4">
          <Link href={`/u/${username}`}
          className="block px-3 py-2 rounded hover:bg-gray-100">
            Your Profile
          </Link>
          <Link href="/dashboard"
          className="block px-3 py-2 rounded hover:bg-gray-100">
            Chat
          </Link>
          <Link href="/groups"
          className="block px-3 py-2 rounded hover:bg-gray-100">
            Groups
          </Link>
          <Link href="/about"
          className="block px-3 py-2 rounded hover:bg-gray-100">
            About
          </Link>
          <button onClick={() => signOut()} className="w-full text-left px-3 py-2 rounded hover:bg-gray-100">
            Logout
          </button>
        </nav>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
}