"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { Button } from "./ui/button"
import { X } from "lucide-react"
// import { Message } from "@/model/User" // This import will be problematic if Message is not directly from User model
import { Message } from "@/model/User"; // Assuming Message is defined in User model or a separate shared type
import axios from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { useToast } from "@/hooks/use-toast"

type MessageCardProps = {
    message: Message;
    onMessageDelete: (messageId: string) => void;
}

const MessageCard = ({message, onMessageDelete}:MessageCardProps) => {
    const {toast} = useToast();

    // Function to format date (can reuse or define here)
    const formatDate = (dateStr: Date | string) => {
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete<ApiResponse>(`/api/messages/${message._id}`);
            toast({
                title: response.data.message,
                variant: "default" // Added variant
            });
            onMessageDelete(message._id as string);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to delete message.",
                variant: "destructive"
            });
        }
    };

    return (
        <Card className="relative"> {/* Added relative for positioning X button */}
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Anonymous Message</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                    Received on: {formatDate(message.createdAt)}
                </CardDescription>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button 
                            variant="destructive" 
                            size="icon"
                            className="absolute top-3 right-3 h-8 w-8" // Positioning and sizing the button
                        >
                            <X className="h-4 w-4"/>
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
                <p className="text-gray-800 break-words">{message.content}</p> {/* Displaying the message content */}
            </CardContent>
        </Card>
    );
};
export default MessageCard;