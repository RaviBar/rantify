"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [accepting, setAccepting] = useState(true);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    if (!session?.user?.username) return;
    const fetchData = async () => {
      const res = await axios.get(`/api/messages?username=${session.user.username}`);
      setMessages(res.data.messages || []);
      setAccepting(res.data.accepting ?? true);
    };
    fetchData();
  }, [session?.user?.username]);

  const handleDelete = async (id: string) => {
    await axios.delete(`/api/messages/${id}`);
    setMessages(msgs => msgs.filter((m: any) => m._id !== id));
  };

  const handleToggle = async () => {
    await axios.post("/api/accept-messages", { acceptMessages: !accepting });
    setAccepting(!accepting);
  };

  const handleCopy = () => {
    const link = `${window.location.origin}/u/${session?.user?.username}`;
    navigator.clipboard.writeText(link);
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus(""), 1500);
  };

  if (status === "loading") return <div className="text-center py-10">Loading...</div>;
  if (!session) return <div className="text-center py-10">Please sign in</div>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Dashboard</h1>

      {/* Profile Link */}
      <div className="flex flex-col md:flex-row items-center gap-2 mb-6">
        <Input
          value={`${window.location.origin}/u/${session.user.username}`}
          readOnly
          className="flex-1"
        />
        <Button onClick={handleCopy} className="w-full md:w-auto mt-2 md:mt-0">
          Copy Profile Link
        </Button>
        {copyStatus && <span className="ml-2 text-green-600">{copyStatus}</span>}
      </div>

      {/* Accepting Messages Toggle */}
      <div className="flex items-center gap-3 mb-8">
        <label className="font-medium text-lg">Accepting Messages</label>
        <button
          onClick={handleToggle}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300
            ${accepting ? "bg-green-500" : "bg-gray-300"}`}
          aria-pressed={accepting}
        >
          <span
            className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300
              ${accepting ? "translate-x-6" : ""}`}
          />
        </button>
        <span className={`text-sm ${accepting ? "text-green-600" : "text-gray-500"}`}>
          {accepting ? "On" : "Off"}
        </span>
      </div>

      {/* Messages Section */}
      <h2 className="text-2xl font-semibold mb-4">Received Messages</h2>
      {messages.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          No messages yet. Share your profile link to start receiving anonymous rants!
        </div>
      ) : (
        <div className="grid gap-5">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition"
            >
              <div className="flex-1">
                <p className="text-gray-800 mb-2 break-words">{msg.content}</p>
                <span className="text-xs text-gray-400">
                  {msg.createdAt ? formatDate(msg.createdAt) : ""}
                </span>
              </div>
              <Button
                variant="destructive"
                onClick={() => handleDelete(msg._id)}
                className="mt-3 md:mt-0 md:ml-4"
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}