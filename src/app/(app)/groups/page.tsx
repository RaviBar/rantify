"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Group {
  _id: string;
  name: string;
  description?: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const { toast } = useToast();

  const fetchGroups = async () => {
    try {
      const response = await axios.get("/api/groups");
      setGroups(response.data.groups);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not fetch groups.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
        toast({ title: "Group name cannot be empty.", variant: "destructive" });
        return;
    }
    try {
      await axios.post("/api/groups", {
        name: newGroupName,
        description: newGroupDescription,
      });
      toast({
        title: "Success",
        description: `Group "${newGroupName}" created successfully!`,
      });
      setNewGroupName("");
      setNewGroupDescription("");
      fetchGroups(); // Refresh the list of groups
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create group.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Create a New Group</h1>
        <form onSubmit={handleCreateGroup} className="bg-white p-6 rounded-lg shadow space-y-4">
            <Input 
                placeholder="Group Name (e.g., general)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
            />
            <Input 
                placeholder="Group Description (Optional)"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
            />
            <Button type="submit">Create Group</Button>
        </form>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-6">Available Groups</h1>
        <div className="space-y-4">
          {groups.length > 0 ? (
            groups.map((group) => (
              <Link
                key={group._id}
                href={`/group/${encodeURIComponent(group.name)}`}
                className="block bg-white rounded-lg shadow p-4 transition hover:shadow-md cursor-pointer"
              >
                <h2 className="font-bold text-xl text-blue-700">{group.name}</h2>
                <p className="text-gray-600">{group.description}</p>
              </Link>

            ))
          ) : (
            <p className="text-gray-500">No groups available. Why not create one?</p>
          )}
        </div>
      </div>
    </div>
  );
}