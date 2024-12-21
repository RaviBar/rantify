"use client"; 
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod"
import Link from "next/link"
import {useEffect, useState} from "react"
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import axios, {AxiosError}  from 'axios';
import { ApiError } from "next/dist/server/api-utils";
import { ApiResponse } from "@/types/ApiResponse";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { signInSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";
const page = () => {  
  const {toast} = useToast();
  const router = useRouter();
  
  const form =  useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn('credentials', {
      redirect: false,
      username: data.username,
      password: data.password
    })
    if(result?.error){
      if(result.error == 'CredentialsSignin'){
        toast({
          title: "Login Failed",
          description: "Incorrect Username and Password",
          variant: "destructive"
        })
      } else{
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        })
      }
    }
    if(result?.url){
        router.replace('/dashboard')
    }
}
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Mystery Message
          </h1>
        <p className="mb-4">Sign in to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6">
          
        <FormField
          name="username"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email/username</FormLabel>
              <FormControl>
                <Input placeholder="email/username" {...field}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          Signin
        </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Not a member? {' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
export default page 






// import { useSession, signIn, signOut } from "next-auth/react";

// export default function HomePage() {
//   const { data: session } = useSession(); // Fetch session information

//   if (session) {
//     return (
//       <>
//         <h1>Welcome, {session.user?.email}</h1>
//         <button onClick={() => signOut()}>Sign out</button>
//       </>
//     );
//   }

//   return (
//     <>
//       <h1>You are not signed in</h1>
//       <button
//         className="bg-orange-500 px-3 py-1 m-4 rounded"
//         onClick={() => signIn()}
//       >
//         Sign in
//       </button>
//     </>
//   );
// }
