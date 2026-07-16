"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RequestsService, ServiceRequest } from "@/services/requests.service";
import { mutate } from "swr";
import { AlertCircle } from "lucide-react";

interface EditRequestModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  request: ServiceRequest | null;
}

export function EditRequestModal({ isOpen, setIsOpen, request }: EditRequestModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (request && isOpen) {
      setTitle(request.title);
      setDescription(request.description);
      setError("");
    }
  }, [request, isOpen]);

  const handleSubmit = async () => {
    if (!request) return;
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    
    try {
      await RequestsService.updateRequest(request.id, {
        title,
        description,
      });
      
      // Update local SWR cache for the list
      mutate("/requests");
      
      setIsOpen(false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to update request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-6 text-white">
          <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Pencil size={20} />
            Edit Request
          </DialogTitle>
          <DialogDescription className="text-indigo-100 mt-1.5 text-xs leading-relaxed">
            You can modify the details of this request as long as it hasn&apos;t started processing.
          </DialogDescription>
        </div>

        <div className="px-6 py-5 space-y-5 bg-card">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">Request Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 rounded-xl bg-secondary/30 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 border-border/50"
              placeholder="Enter title"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">Detailed Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] rounded-xl bg-secondary/30 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 border-border/50 resize-none"
              placeholder="Enter description"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="rounded-xl font-medium hover:bg-secondary transition-all hover:scale-105 active:scale-95 duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 shadow-md shadow-indigo-200 hover:shadow-lg transition-all hover:scale-105 active:scale-95 duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
