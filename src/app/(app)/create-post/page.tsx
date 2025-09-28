"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const postSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  mediaUrl: z.string().optional(),
});

export default function CreatePostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: '',
      category: '',
      mediaUrl: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof postSchema>) => {
    setIsSubmitting(true);
    try {
      await axios.post('/api/posts', data);
      toast({ title: 'Success', description: 'Post created successfully!' });
      router.push('/');
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return <div>Please log in to create a post.</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Rant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <Textarea id="content" {...form.register('content')} />
              {form.formState.errors.content && (
                <p className="text-red-500 text-sm">{form.formState.errors.content.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <Input id="category" {...form.register('category')} />
              {form.formState.errors.category && (
                <p className="text-red-500 text-sm">{form.formState.errors.category.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="mediaUrl" className="block text-sm font-medium text-gray-700">
                Media URL (Optional)
              </label>
              <Input id="mediaUrl" {...form.register('mediaUrl')} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Post'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}