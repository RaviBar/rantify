"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  message: string;
  username: string;
}

export default function GroupPage() {
  const { id: groupId } = useParams();
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    if (!session?.user) return;

    const newSocket = io();
    setSocket(newSocket);

    newSocket.emit("join-group", groupId);

    const handleNewMessage = (newMessage: ChatMessage) => {
      setChat((prevChat) => [...prevChat, newMessage]);
    };

    newSocket.on("group-message", handleNewMessage);

    return () => {
      newSocket.off("group-message", handleNewMessage);
      newSocket.disconnect();
    };
  }, [groupId, session]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && socket && session?.user?.username) {
      const newMessage: ChatMessage = {
        message,
        username: session.user.username,
      };

      // Optimistically update the sender's UI
      setChat((prevChat) => [...prevChat, newMessage]);

      // Send the message to the server to be broadcast to others
      socket.emit("group-message", { groupId, ...newMessage });
      setMessage("");
    }
  };

  if (!session || !session.user) {
    return (
      <div className="text-center py-10">
        Please log in to join the chat.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Group Chat</h1>
      <p className="text-lg text-blue-700 font-semibold mb-6">{groupId}</p>
      <div className="bg-white rounded-lg shadow-xl p-4 flex flex-col h-[70vh]">
        <div className="flex-1 space-y-4 overflow-y-auto mb-4 border rounded p-4 bg-gray-50">
          {chat.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.username === session.user.username
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                  msg.username === session.user.username
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p className="font-bold text-sm">{msg.username}</p>
                <p className="break-words">{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            autoComplete="off"
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}