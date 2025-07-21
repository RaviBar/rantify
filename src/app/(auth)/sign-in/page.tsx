"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setStatus("Invalid username or password.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign in to Rantify</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={20}
            className="w-full border rounded p-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border rounded p-2"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>
        {status && <p className="mt-4 text-center text-red-600">{status}</p>}
        <p className="mt-4 text-center text-gray-600">
        Don&apos;t have an account?{" "}
        <a href="/sign-up" className="text-blue-600 hover:underline">Sign up</a>
      </p>
      </div>
    </div>
  );
}