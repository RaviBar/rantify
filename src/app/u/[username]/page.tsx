"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
    return <textarea {...props} className="border rounded w-full px-3 py-2" />;
};

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<null | string>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      await axios.post("/api/send-messages", {
        username,
        content: message,
      });
      setStatus("Message sent anonymously!");
      setMessage("");
    } catch (err) {
      setStatus("Failed to send message.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Send an anonymous message to <span className="text-blue-600">{username}</span></h1>
        <form onSubmit={handleSend} className="space-y-4">
          <Textarea
            placeholder="Type your anonymous message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
          />
          <Button type="submit">Send</Button>
        </form>
        {status && <p className="mt-4 text-center">{status}</p>}
      </div>
    </div>
  );
}