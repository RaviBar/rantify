"use client";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import type { Message } from "@/types";

import axios, { isAxiosError } from "axios";
import type { ApiResponse } from "@/types/ApiResponse";
import { useToast } from "@/hooks/use-toast";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const { toast } = useToast();

  const formatDate = (dateStr: Date | string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const handleDeleteConfirm = async () => {
    try {
      const { data } = await axios.delete<ApiResponse>(`/api/messages/${String(message._id)}`);
      toast({
        title: data.message ?? "Deleted",
        variant: "default",
      });
      onMessageDelete(String(message._id));
    } catch (err: unknown) {
      if (isAxiosError<ApiResponse>(err)) {
        toast({
          title: "Error",
          description: err.response?.data?.message ?? err.message ?? "Failed to delete message.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete message.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Anonymous Message</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Received on: {formatDate(message.createdAt)}
        </CardDescription>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-3 right-3 h-8 w-8"
              aria-label="Delete message"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this message?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this anonymous message from your inbox.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>

      <CardContent>
        <p className="text-gray-800 break-words">{message.content}</p>
      </CardContent>
    </Card>
  );
};

export default MessageCard;
