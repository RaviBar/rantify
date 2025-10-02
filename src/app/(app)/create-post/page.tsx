"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
});

type FormValues = z.infer<typeof postSchema>;

export default function CreatePostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", content: "", category: "" },
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }

    const maxMB = 5;
    if (f.size > maxMB * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: `Please choose an image under ${maxMB} MB.`,
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }
    if (!/^image\//.test(f.type)) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", data.title);
      fd.append("content", data.content);
      fd.append("category", data.category);
      if (file) fd.append("media", file);

      await axios.post("/api/posts", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({ title: "Success", description: "Post created successfully!" });
      router.push("/");
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) return <div>Please log in to create a post.</div>;

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Rant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <Textarea id="content" {...form.register("content")} />
              {form.formState.errors.content && (
                <p className="text-red-500 text-sm">{form.formState.errors.content.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <Input id="category" {...form.register("category")} />
              {form.formState.errors.category && (
                <p className="text-red-500 text-sm">{form.formState.errors.category.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="media" className="block text-sm font-medium text-gray-700">
                Image (Optional)
              </label>
              <Input id="media" type="file" accept="image/*" onChange={onFileChange} />
              {preview && (
                <Image
                  src={preview}
                  alt="preview"
                  width={500}
                  height={200}
                  unoptimized
                  className="mt-2 h-48 w-full object-cover rounded-md"
                  onLoadingComplete={() => {
                    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
                  }}
                />
              )}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Post"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}