// app/post/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, ArrowUp } from "lucide-react";
import Image from "next/image";

interface CommentDTO {
  _id: string;
  content: string;
  author: { username: string };
  createdAt: string;
}
interface PostDTO {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: { username: string };
  createdAt: string;
  votes: number;
  comments: CommentDTO[];
  mediaUrl?: string;
}

export default function PostPage() {
  const [post, setPost] = useState<PostDTO | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const postId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async (id: string) => {
      try {
        const res = await axios.get<{ post: PostDTO }>(`/api/posts/${id}`);
        setPost(res.data.post);
      } catch (error) {
        console.error("Error fetching post:", error);
        toast({
          title: "Error",
          description: "Failed to fetch post.",
          variant: "destructive",
        });
      }
    };
    if (postId) {
      fetchPost(postId);
    }
  }, [postId, toast]);

  const handleVote = async (value: number) => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }
    if (!postId) return;
    try {
      await axios.post("/api/votes", { postId, value });
      const res = await axios.get<{ post: PostDTO }>(`/api/posts/${postId}`);
      setPost(res.data.post);
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to vote.",
        variant: "destructive",
      });
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to comment.",
        variant: "destructive",
      });
      return;
    }
    if (!postId) return;

    setIsSubmitting(true);
    try {
      await axios.post("/api/comments", { postId, content: newComment });
      setNewComment("");
      const res = await axios.get<{ post: PostDTO }>(`/api/posts/${postId}`);
      setPost(res.data.post);
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to submit comment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!postId) return <div>Invalid post id.</div>;
  if (!post) return <div>Loading...</div>;

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>{post.title}</CardTitle>
          <div className="text-sm text-gray-500">
            Posted by {post.author.username} in r/{post.category} on{" "}
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{post.content}</p>
          {post.mediaUrl && 
          <Image
            src={post.mediaUrl}
            alt="Post media"
            width={800}       
            height={600}      
            className="my-4 rounded-md"/>}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => handleVote(1)}>
              <ArrowUp />
            </Button>
            <span>{post.votes}</span>
            <Button variant="ghost" size="icon" onClick={() => handleVote(-1)}>
              <ArrowDown />
            </Button>
          </div>

          {/* ... (rest of the component remains the same) ... */}
        </CardContent>
      </Card>
    </div>
  );
}