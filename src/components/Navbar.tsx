'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, PlusSquare, Search, User as UserIcon } from 'lucide-react';
import { SidebarDrawer } from '../components/SidebarDrawer';

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [copyStatus, setCopyStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleCopy = () => {
    if (!user?.username) return;
    navigator.clipboard.writeText(`${window.location.origin}/u/${user.username}`);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus(''), 1500);
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between py-3 px-4 md:px-6">
          {/* Avatar Icon */}
          {status === 'authenticated' && (
            <button onClick={() => setDrawerOpen(true)} className="p-1 rounded hover:bg-gray-100">
              <UserIcon size={24} />
            </button>
          )}

          {/* Logo */}
          <Link href="/" className="text-2xl font-extrabold text-gray-900">
            Rantify
          </Link>

          {/* Search & Actions */}
          <div className="flex items-center gap-3 flex-1 mx-4">
            {status === 'authenticated' && (
              <form onSubmit={onSearch} className="relative flex-1 hidden md:block">
                <Input
                  placeholder="Search rants or topics..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </form>
            )}

            {/* Create Post */}
            {status === 'authenticated' && (
              <Link href="/create-post">
                <Button variant="outline" size="icon" title="New Rant">
                  <PlusSquare size={20} />
                </Button>
              </Link>
            )}
          </div>

          {/* Profile Copy & Auth */}
          <div className="flex items-center gap-2">
            {status === 'authenticated' && user ? (
              <>
                <Input
                  value={`${window.location.origin}/u/${user.username}`}
                  readOnly
                  className="w-36 text-xs"
                  onClick={e => (e.target as HTMLInputElement).select()}
                />
                <Button variant="outline" size="icon" onClick={handleCopy} title="Copy profile link">
                  <Copy size={16} />
                </Button>
                <Button variant="destructive" onClick={() => signOut()}>
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/sign-in">
                <Button>Login</Button>
              </Link>
            )}
            {copyStatus && <span className="text-green-600 text-xs ml-1">{copyStatus}</span>}
          </div>
        </div>
      </nav>
      <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} username={user?.username} />
    </>
  );
}