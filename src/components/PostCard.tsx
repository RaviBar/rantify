'use client';
import Link from 'next/link';
import Image from 'next/image';

interface PostCardProps {
  post: {
    _id: string;
    title?: string;
    content?: string;
    category?: string | { name?: string };
    createdAt?: string;
    votes?: number;
    comments?: any[];
    author?: { username?: string };
    mediaUrl?: string | null;
  };
}

function isValidNextImageSrc(src?: string | null): boolean {
  return !!src && (src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://'));
}
function isCategoryObject(
  x: unknown
): x is { name?: string } {
  return !!x && typeof x === "object" && "name" in (x as any);
}
export default function PostCard({ post }: PostCardProps) {
  const category: string = (() => {
    if (!post?.category) return "Uncategorized";
    if (typeof post.category === "string") return post.category;
    if (isCategoryObject(post.category)) return post.category.name ?? "Uncategorized";
    return "Uncategorized";
  })();
  const title = post.title ?? 'Untitled';

  const imageSrc = post.mediaUrl && isValidNextImageSrc(post.mediaUrl) ? post.mediaUrl : null;

  return (
    <article
      className="bg-white rounded-lg border p-4 mb-4 shadow-sm transform transition will-change-transform hover:shadow-lg hover:-translate-y-1 focus-within:shadow-lg focus-within:-translate-y-1"
      tabIndex={-1}
    >
      <div className="flex gap-4">
        {imageSrc && (
          <div className="w-28 h-20 relative flex-shrink-0 rounded overflow-hidden bg-slate-50">
            <Image
              src={imageSrc}
              alt={`Media for post by ${post.author?.username || 'anon'}`}
              fill
              sizes="112px"
              style={{ objectFit: 'cover' }}
              className="rounded"
              priority={false}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded">{category}</span>
            {post.createdAt && <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</span>}
          </div>

          <Link
            href={`/post/${encodeURIComponent(post._id)}`}
            className="font-medium text-gray-900 hover:text-sky-700 transition block mb-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 rounded"
          >
            {title.length > 140 ? title.slice(0, 140) + '...' : title}
          </Link>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span> ▲ {post.votes || 0} votes</span>
            <span>{post.comments?.length || 0} comments</span>
            <span>by {post.author?.username || 'anon'}</span>
          </div>
        </div>
      </div>
    </article>
  );
}