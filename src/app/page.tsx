'use client';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import PostCard from '@/components/PostCard';
import SidebarRight from '@/components/SidebarRight';

/* -------------------- Dark Mode Toggle (client-only) -------------------- */
function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved as any;
    // fallback to system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  if (!mounted) {
    // Avoid hydration mismatch; render a simple placeholder
    return (
      <button
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300/70 bg-white text-slate-700 dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-200"
        aria-label="Toggle theme"
      >
        ○
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="group inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300/70 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {/* Sun / Moon */}
      <svg
        className="h-5 w-5 opacity-100 group-active:scale-95 transition"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" fill="currentColor"
      >
        {theme === 'dark' ? (
          // Sun (show when dark to indicate switching to light)
          <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a1 1 0 0 1-1-1v-1.25a1 1 0 1 1 2 0V21a1 1 0 0 1-1 1ZM12 3a1 1 0 0 0 1-1V.75a1 1 0 1 0-2 0V2a1 1 0 0 0 1 1Zm9 9a1 1 0 0 1-1 1h-1.25a1 1 0 1 1 0-2H20a1 1 0 0 1 1 1ZM5.25 12a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h1.25a1 1 0 0 1 1 1Zm13.657 6.657a1 1 0 0 1-1.414 1.414l-.884-.884a1 1 0 0 1 1.414-1.414l.884.884ZM6.391 5.223a1 1 0 0 0 1.414-1.414l-.884-.884A1 1 0 0 0 5.507 4.23l.884.993Zm11.266-1.414a1 1 0 0 1 0 1.414l-.884.884A1 1 0 1 1 15.36 4.7l.884-.884a1 1 0 0 1 1.414-.007ZM7.275 18.187a1 1 0 1 0-1.414-1.414l-.884.884a1 1 0 0 0 1.414 1.414l.884-.884Z" />
        ) : (
          // Moon (show when light to indicate switching to dark)
          <path d="M21.64 13.03A9 9 0 1 1 10.97 2.36a.75.75 0 0 1 .85.99 7.5 7.5 0 0 0 9.79 9.79.75.75 0 0 1 .03 1.89Z" />
        )}
      </svg>
    </button>
  );
}

/* -------------------- Debounce -------------------- */
function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [recent, setRecent] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<'trending' | 'recent' | 'top'>('trending');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [postsRes, catRes, recentRes] = await Promise.all([
          axios.get(`/api/posts?sort=${sort}`),
          axios.get('/api/categories'),
          axios.get('/api/posts?sort=recent&limit=5'),
        ]);
        if (!mounted) return;
        setPosts(postsRes.data.posts || []);
        setCategories(catRes.data.categories || []);
        setRecent((recentRes.data.posts || []).map((p: any) => ({
          id: p._id,
          title: (p.content || '').slice(0, 50) + (p.content?.length > 50 ? '...' : ''),
        })));
      } catch (err) {
        console.error('Load error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [sort]);

  // Build category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => {
      const raw = p?.category ?? (p?.category?.name) ?? 'Uncategorized';
      const name = String(raw || 'Uncategorized');
      counts[name] = (counts[name] || 0) + 1;
    });
    const names = categories.map((c: any) => c.name ?? c);
    names.forEach((n: string) => { if (!counts[n]) counts[n] = counts[n] || 0; });
    return counts;
  }, [posts, categories]);

  // Category match
  const matchesCategory = (post: any, cat: string | null) => {
    if (!cat) return true;
    const pc = post?.category ?? (post?.category?.name) ?? '';
    return String(pc).toLowerCase() === cat.toLowerCase();
  };

  // Filtered posts
  const filteredPosts = useMemo(() => {
    let list = posts.slice();
    if (selectedCategory) list = list.filter(p => matchesCategory(p, selectedCategory));
    if (debouncedQuery && debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter(p =>
        (p.content || '').toLowerCase().includes(q) ||
        String(p.category || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [posts, selectedCategory, debouncedQuery]);

  return (
    <main
      className="min-h-screen pb-12"
      style={{
        // soft gradient + texture; auto-inverts subtly in dark
        backgroundImage: `
          radial-gradient(1200px 600px at 20% -10%, rgba(14,165,233,0.12), transparent 60%),
          radial-gradient(900px 450px at 120% 10%, rgba(99,102,241,0.10), transparent 60%),
          linear-gradient(180deg, rgba(248,250,252,1), rgba(241,245,249,1))
        `,
      }}
    >

      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HERO */}
        <header className="mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-slate-100">
                  Speak freely. Be heard.
                </h1>
                <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
                  Anonymous, privacy-first platform for honest feedback and open discussion — vote, share, and surface what matters.
                </p>
                <div className="mt-4 flex gap-3">
                  <Link
                    href="/create-post"
                    className="inline-flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-500 dark:hover:bg-sky-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11 4a1 1 0 1 1 2 0v7h7a1 1 0 1 1 0 2h-7v7a1 1 0 1 1-2 0v-7H4a1 1 0 1 1 0-2h7z"/></svg>
                    New Rant
                  </Link>
                  <Link
                    href="/trending"
                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    Explore Trending
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100">Trending</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Real-time</div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Top categories</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.keys(categoryCounts).slice(0, 4).map((n) => (
                      <button
                        key={n}
                        onClick={() => setSelectedCategory(n)}
                        className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 transition hover:brightness-95 dark:bg-sky-400/15 dark:text-sky-300"
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 space-y-4">
              <div className="rounded-xl border bg-white p-4 shadow-sm transition dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Categories</h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`flex items-center justify-between rounded px-3 py-2 text-left text-sm transition ${
                      selectedCategory === null
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-400/20 dark:text-sky-300'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>All</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{posts.length}</span>
                  </button>

                  {Object.keys(categoryCounts).map((name) => (
                    <button
                      key={name}
                      onClick={() => setSelectedCategory(name)}
                      className={`transform rounded px-3 py-2 text-left text-sm transition ${
                        selectedCategory === name
                          ? 'scale-[1.01] bg-sky-50 text-sky-700 shadow-sm dark:bg-sky-400/20 dark:text-sky-300'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span>{name}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{categoryCounts[name]}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border bg-white p-4 shadow-sm transition dark:border-slate-800 dark:bg-slate-900">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200">Feedback</h4>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Help improve Rantify — share product feedback or report content anonymously.
                </p>
                <Link
                  href="/feedback"
                  className="mt-3 inline-block w-full rounded-md bg-gray-600 py-2 text-center font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-500 dark:hover:bg-sky-600"
                >
                  Give Feedback
                </Link>
              </div>
            </div>
          </aside>

          {/* Main feed */}
          <section className="lg:col-span-6">
            {/* Controls */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center gap-3">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative flex-1">
                  <input
                    id="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search rants, categories, or text…"
                    className="w-full rounded-lg border border-slate-300 bg-white/70 px-4 py-2 pr-10 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <svg className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.4-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="rounded-lg border border-slate-300 bg-white/70 px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
                  aria-label="Sort posts"
                >
                  <option value="trending">Trending</option>
                  <option value="recent">Recent</option>
                  <option value="top">Top</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {selectedCategory && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <span>{selectedCategory}</span>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      aria-label="Clear category"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <Link
                  href="/create-post"
                  className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 sm:hidden dark:bg-sky-500 dark:hover:bg-sky-600"
                >
                  New
                </Link>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="mb-3 h-4 w-3/5 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="mb-2 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-12 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                ))
              ) : filteredPosts.length === 0 ? (
                <div className="rounded-xl border bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No rants found</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try a different search or choose another category.</p>
                  <div className="mt-4">
                    <Link
                      href="/create-post"
                      className="inline-block rounded-md bg-sky-600 px-4 py-2 font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-500 dark:hover:bg-sky-600"
                    >
                      Create Rant
                    </Link>
                  </div>
                </div>
              ) : (
                filteredPosts.map((post: any) => (
                  <PostCard key={post._id} post={post} />
                ))
              )}
            </div>
          </section>

          {/* Right sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-28 space-y-4">
              <SidebarRight recent={recent} />
              <div className="rounded-xl border bg-white p-4 shadow-sm transition dark:border-slate-800 dark:bg-slate-900">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pro Tip</h4>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Use specific keywords in the search to find relevant rants faster.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
