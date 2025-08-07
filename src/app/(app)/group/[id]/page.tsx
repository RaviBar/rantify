"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  message: string;
  username: string;
}

export default function GroupPage() {
  const { id: groupId } = useParams();
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<Message[]>([]);

  useEffect(() => {
    // Establish a new WebSocket connection
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    // Join the specific group chat room
    newSocket.emit("join-group", groupId);

    // Listen for incoming messages
    newSocket.on("group-message", (newMessage: Message) => {
      setChat((prevChat) => [...prevChat, newMessage]);
    });

    // Clean up the connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, [groupId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && socket && session?.user?.username) {
      const newMessage: Message = { message, username: session.user.username };
      socket.emit("group-message", { groupId, ...newMessage });
      setChat((prevChat) => [...prevChat, newMessage]); // Add own message to chat
      setMessage("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Group Chat: {groupId}</h1>
      <div className="bg-white rounded shadow p-4">
        <div className="space-y-4 h-96 overflow-y-auto mb-4 border rounded p-4">
          {chat.map((msg, index) => (
            <div key={index} className={`flex ${msg.username === session?.user?.username ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg px-4 py-2 ${msg.username === session?.user?.username ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <p className="font-bold">{msg.username}</p>
                <p>{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}