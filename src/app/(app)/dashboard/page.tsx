"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/model/User";
import { ApiResponse } from "@/types/ApiResponse";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCcw, Copy } from "lucide-react";
import MessageCard from "@/components/MessageCard";

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();
  const [formLoaded, setFormLoaded] = useState(false);

const form = useForm({
  defaultValues: {
    acceptMessages: false,
  },
});
const { register, watch, setValue } = form;
const acceptMessages = watch('acceptMessages');

const fetchAcceptMessageStatus = useCallback(async () => {
  setIsSwitchLoading(true);
  try {
    const response = await axios.get<ApiResponse>('/api/accept-messages');
    const status = response.data.isAcceptingMessages ?? false;
    setValue('acceptMessages', status); // Set in form
    setFormLoaded(true); // Mark form as ready to render
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
}, [setValue, toast]);


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
        acceptMessages: !acceptMessages,
      });
      setValue('acceptMessages', !acceptMessages);
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
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded-lg shadow-xl w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
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
      </div>
      {formLoaded ? (
  <div className="mb-4 flex items-center">
    <Switch
      {...register('acceptMessages')}
      checked={acceptMessages}
      onCheckedChange={handleSwitchChange}
      disabled={isSwitchLoading}
    />
    <span className="ml-2">
      Accept Messages: {acceptMessages ? 'On' : 'Off'}
    </span>
  </div>
) : (
  <div className="mb-4">Loading toggle state...</div>
)}
      <Separator />
      <Button
        className="mt-4"
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
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
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
  );
}