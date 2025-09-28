"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface Comment {
  _id: string;
  content: string;
  author: {
    username: string;
  };
  createdAt: string;
}

interface Post {
  _id: string;
  content: string;
  category: string;
  author: {
    username: string;
  };
  createdAt: string;
  votes: number;
  comments: Comment[];
  mediaUrl?: string;
}

export default function PostPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams();
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/posts/${id}`);
      setPost(response.data.post);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch post.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleVote = async (value: number) => {
    if (!session) {
      toast({
        title: 'Error',
        description: 'You must be logged in to vote.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await axios.post('/api/votes', { postId: id, value });
      fetchPost(); // Re-fetch post to update vote count
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Error',
        description: 'Failed to vote. You may have already voted.',
        variant: 'destructive',
      });
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast({
        title: 'Error',
        description: 'You must be logged in to comment.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post('/api/comments', { postId: id, content: newComment });
      setNewComment('');
      fetchPost(); // Re-fetch post to update comments
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit comment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>{post.content}</CardTitle>
          <div className="text-sm text-gray-500">
            Posted by {post.author.username} in r/{post.category} on{' '}
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </CardHeader>
        <CardContent>
          {post.mediaUrl && <img src={post.mediaUrl} alt="Post media" className="my-4 rounded-md" />}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => handleVote(1)}>
              <ArrowUp />
            </Button>
            <span>{post.votes}</span>
            <Button variant="ghost" size="icon" onClick={() => handleVote(-1)}>
              <ArrowDown />
            </Button>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold">Comments</h3>
            <form onSubmit={handleCommentSubmit} className="mt-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment"
              />
              <Button type="submit" className="mt-2" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </form>
            <div className="mt-4 space-y-4">
              {post.comments.map((comment) => (
                <div key={comment._id} className="p-4 bg-gray-100 rounded-md">
                  <p className="text-sm text-gray-500">
                    {comment.author.username} - {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                  <p>{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}