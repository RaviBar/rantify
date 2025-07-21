import Link from "next/link";

interface PostCardProps {
  post: {
    _id: string;
    content: string;
    category: string;
    createdAt: string;
    votes?: number;
    comments?: any[];
    author?: { username?: string };
  };
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 border hover:shadow-md transition">
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
      </div>
  );
}