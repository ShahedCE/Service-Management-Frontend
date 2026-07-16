"use client";

import { useState } from "react";
import { UsersService, User } from "@/services/users.service";
import { mutate } from "swr";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DeleteUserModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function DeleteUserModal({ isOpen, setIsOpen, user, onSuccess }: DeleteUserModalProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    setIsActionLoading(true);
    try {
      await UsersService.deleteUser(user.id);
      mutate("/users");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 mx-auto">
            <Trash2 size={24} />
          </div>
          <DialogTitle className="text-center text-xl font-bold mb-2">Delete Operator?</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to permanently remove <strong>{user?.name}</strong>? This action cannot be undone.
          </DialogDescription>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isActionLoading}
              className="w-full rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              disabled={isActionLoading}
              className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200"
            >
              {isActionLoading ? "Deleting..." : "Yes, Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
