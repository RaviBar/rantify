"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCcw, Copy } from "lucide-react"; // Import Copy icon
import MessageCard from "@/components/MessageCard";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import { User as UserType, Message } from "@/model/User"; // Use UserType to avoid conflict with NextAuth User

import PostCard from "@/components/PostCard"; // Import PostCard

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

export default function DashboardPage() {
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]); // Renamed for clarity
  const [userPosts, setUserPosts] = useState<any[]>([]); // State for user's own posts
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { toast } = useToast();
  const { data: session, status } = useSession();

  const user = session?.user as UserType; // Type assertion

  const [profileUrl, setProfileUrl] = useState("");
  const [acceptMessages, setAcceptMessages] = useState(true); // State for switch
  const [copyStatus, setCopyStatus] = useState(""); // State for copy status message

  // Fetch accept message status
  const fetchAcceptMessageStatus = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setAcceptMessages(response.data.isAcceptingMessage ?? true);
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

  // Fetch received messages
  const fetchReceivedMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoadingMessages(true);
    try {
      const response = await axios.get<ApiResponse>('/api/messages');
      setReceivedMessages(response.data.messages || []);
      if (refresh) {
        toast({
          title: "Messages Refreshed",
          description: "Showing the latest anonymous messages.",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to fetch messages.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [toast]);

  // Fetch user's own posts
  const fetchUserPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      // Assuming you'll have an API route to get posts by author ID
      interface PostsResponse extends ApiResponse {
        posts: any[];
      }
      const response = await axios.get<PostsResponse>(`/api/posts?authorId=${user._id}`);
      setUserPosts(response.data.posts || []);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to fetch your posts.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPosts(false);
    }
  }, [user?._id, toast]);


  useEffect(() => {
    if (session && session.user) {
      fetchAcceptMessageStatus();
      fetchReceivedMessages();
      fetchUserPosts(); // Fetch user's posts on load
    }
  }, [session, fetchAcceptMessageStatus, fetchReceivedMessages, fetchUserPosts]);

  useEffect(() => {
    if (typeof window !== "undefined" && user?.username) {
      setProfileUrl(`${window.location.protocol}//${window.location.host}/u/${user.username}`);
    }
  }, [user?.username]);

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await axios.delete<ApiResponse>(`/api/messages/${messageId}`);
      toast({ title: response.data.message });
      setReceivedMessages(receivedMessages.filter((msg) => String(msg._id) !== messageId));
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to delete message.",
        variant: "destructive",
      });
    }
  };

  const handleSwitchChange = async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });
      setAcceptMessages(!acceptMessages);
      toast({ title: response.data.message, variant: "default" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to update message acceptance status.",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  };
  const copyToClipboard = () => {
    if (profileUrl) {
      navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Link Copied",
        description: "Your unique profile link has been copied to clipboard!",
      });
      setCopyStatus("Your unique profile link has been copied to clipboard!");
    }
  };

  if (status === "loading") {
    return <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
  }
  if (!session || !session.user) {
    return <div className="text-center py-10">Please login to view your dashboard.</div>;
  }

  return ( 
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded-lg shadow-xl w-full max-w-6xl">
      <h1 className="text-4xl font-extrabold text-blue-700 mb-6 text-center">User Dashboard</h1>

      {/* Profile Link Section */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold mb-2 text-blue-800">Your Anonymous Profile Link</h2>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={profileUrl}
            disabled
            readOnly
            className="flex-1 min-w-0"
          />
          <Button onClick={copyToClipboard} title="Copy Link" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Copy className="h-4 w-4 mr-2" /> Copy
          </Button>
        </div>
        {copyStatus && <p className="text-green-600 text-sm mt-2">{copyStatus}</p>}
      </div>

      {/* Message Acceptance Toggle */}
      <div className="flex items-center space-x-3 mb-8">
        <Switch
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="font-medium text-lg text-gray-800">
          Accept anonymous DMs: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>

      <Separator className="my-8 bg-gray-200" />

      {/* User's Own Posts Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-700">Your Rants</h2>
          <Button
            variant="outline"
            onClick={() => fetchUserPosts()}
            disabled={isLoadingPosts}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            {isLoadingPosts ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Refresh Your Rants
          </Button>
        </div>
        {isLoadingPosts ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="text-gray-500 mt-2">Loading your rants...</p>
          </div>
        ) : userPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {userPosts.map((post) => (
              <PostCard key={String(post._id)} post={post} /> // Reusing PostCard
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
            You haven't posted any rants yet. Time to speak your mind anonymously!
            <Link href="/create-post">
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Create Your First Rant</Button>
            </Link>
          </div>
        )}
      </div>

      <Separator className="my-8 bg-gray-200" />

      {/* Received Anonymous Messages Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-700">Received Anonymous Messages</h2>
          <Button
            variant="outline"
            onClick={() => fetchReceivedMessages(true)}
            disabled={isLoadingMessages}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            {isLoadingMessages ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Refresh Messages
          </Button>
        </div>
        {isLoadingMessages ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="text-gray-500 mt-2">Loading messages...</p>
          </div>
        ) : receivedMessages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {receivedMessages.map((message) => (
              <MessageCard
                key={String(message._id)}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
            No anonymous DMs to display. Share your profile link to start receiving feedback!
          </div>
        )}
      </div>
    </div>
  );
}