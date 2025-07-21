"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    try {
      const res = await axios.post("/api/sign-up", { username, password });
      if (res.data.success) {
        setStatus("Sign up successful! You can now sign in.");
        setTimeout(() => router.push("/sign-in"), 1500);
      } else {
        setStatus(res.data.message || "Sign up failed.");
      }
    } catch (err: any) {
      setStatus(err.response?.data?.message || "Sign up failed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Create your Rantify account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username (immutable)"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={20}
            pattern="^[a-zA-Z0-9_]+$"
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
            Sign Up
          </button>
        </form>
        {status && <p className="mt-4 text-center text-red-600">{status}</p>}
      </div>
    </div>
  );
}