"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; 
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { signInSchema } from "@/schemas/signInSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'; 

  const urlError = searchParams.get('error');

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "", // This is username or email
      password: "",
    },
  });

  useEffect(() => {
    if (urlError) {
      if (urlError === 'CredentialsSignin') {
        toast({
          title: "Login Failed",
          description: "Invalid username/email or password.",
          variant: "destructive",
        });
      } else if (urlError === 'Unauthorized') {
        // This is the error thrown by NextAuth.js if authorize throws "Please verify your account"
        toast({
          title: "Account Not Verified",
          description: "Please verify your account before logging in. Check your email for the verification code.",
          variant: "destructive",
        });
        // Optionally, redirect to the verify page here if you want to force it from login page
        // router.push(`/verify/${form.getValues('identifier')}`); // This would require getting username from identifier
      } else {
        toast({
          title: "Login Failed",
          description: urlError || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [urlError, toast]);


  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await signIn('credentials', {
        redirect: false, // Prevent NextAuth.js from redirecting automatically
        identifier: data.identifier,
        password: data.password,
      });

      if (result?.error) {
        // If the error is due to unverified account, NextAuth.js might return a specific error string
        // or the authorize callback might throw an error that gets caught here.
        // We've already handled the 'Unauthorized' error via URL param in useEffect.
        // For other errors, show a generic message or specific ones if needed.
        if (result.error === 'CredentialsSignin') {
            toast({
                title: "Login Failed",
                description: "Invalid username/email or password.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Login Failed",
                description: result.error || "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        }
      }

      if (result?.ok && !result?.error) {
        toast({
          title: "Login Successful",
          description: "Welcome back to Rantify!",
        });
        router.replace(callbackUrl); // Redirect to dashboard or original callback URL
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-blue-700">
            Welcome Back to Rantify
          </h1>
          <p className="mb-4 text-gray-600">
            Sign in to continue your anonymous discussions
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username or Email</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input {...field} type="password" />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Not a member yet?{" "}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}