"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/model/User";
import { ApiResponse } from "@/types/ApiResponse";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCcw, Copy } from "lucide-react";
import MessageCard from "@/components/MessageCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [isAcceptingMessages, setIsAcceptingMessages] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();

  const fetchAcceptMessageStatus = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setIsAcceptingMessages(response.data.isAcceptingMessages ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to fetch message settings",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [toast]);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/messages');
      setMessages(response.data.messages || []);
      if (refresh) {
        toast({ title: "Messages Refreshed" });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to fetch messages.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessageStatus();
  }, [session, fetchMessages, fetchAcceptMessageStatus]);

  const handleSwitchChange = async () => {
    try {
      await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !isAcceptingMessages,
      });
      setIsAcceptingMessages(!isAcceptingMessages);
      toast({ title: 'Message acceptance status updated successfully' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to update settings.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    if (session?.user?.username) {
      const profileUrl = `${window.location.origin}/u/${session.user.username}`;
      navigator.clipboard.writeText(profileUrl);
      toast({ title: "URL Copied to Clipboard" });
    }
  };

  if (!session || !session.user) {
    return <div className="text-center py-10">Please log in.</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Anonymous Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={`${window.location.origin}/u/${session.user.username}`}
                disabled
                readOnly
                className="input input-bordered w-full p-2 bg-gray-100"
              />
              <Button onClick={copyToClipboard}><Copy className="w-4 h-4 mr-2" /> Copy</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Message Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>Accepting Messages</span>
              <Switch
                checked={isAcceptingMessages}
                onCheckedChange={handleSwitchChange}
                disabled={isSwitchLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Messages</h2>
          <Button
            variant="outline"
            onClick={() => fetchMessages(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.length > 0 ? (
            messages.map((message) => (
              <MessageCard
                key={String(message._id)}
                message={message}
                onMessageDelete={() => setMessages(messages.filter((m) => m._id !== message._id))}
              />
            ))
          ) : (
            <p>No messages to display.</p>
          )}
        </div>
      </div>
    </div>
  );
}