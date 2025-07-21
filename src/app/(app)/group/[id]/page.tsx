"use client";
import { useParams } from "next/navigation";

export default function GroupPage() {
  const { id } = useParams();
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Group Chat: {id}</h1>
      <div className="bg-white rounded shadow p-4">
        {/* Real-time chat UI goes here */}
        <p className="text-gray-500">Live group chat coming soon...</p>
      </div>
    </div>
  );
}