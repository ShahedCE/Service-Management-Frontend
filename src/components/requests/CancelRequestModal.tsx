"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RequestsService, ServiceRequest } from "@/services/requests.service";
import { mutate } from "swr";

interface CancelRequestModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  request: ServiceRequest | null;
}

export function CancelRequestModal({ isOpen, setIsOpen, request }: CancelRequestModalProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const handleCancel = async () => {
    if (!request) return;
    setIsActionLoading(true);
    setActionError("");

    try {
      await RequestsService.cancelRequest(request.id);
      
      // Update local SWR cache for the list and stats
      mutate("/requests");
      mutate("/requests/stats");

      setIsOpen(false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(error.response?.data?.message || "Failed to cancel request.");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl">
        <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> Warning
        </DialogTitle>
        <DialogDescription className="text-base text-foreground mt-2">
          Are you sure you want to cancel this request? If you cancel, the request will no longer be processed.
        </DialogDescription>
        
        {actionError && (
          <div className="text-red-600 text-[13px] font-medium bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 mt-4">
            <AlertCircle size={14} className="shrink-0" />
            {actionError}
          </div>
        )}

        <DialogFooter className="mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="rounded-xl border-slate-300 hover:bg-slate-100 w-full"
            disabled={isActionLoading}
          >
            No, Keep it
          </Button>
          <Button
            onClick={handleCancel}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white w-full shadow-md shadow-red-200"
            disabled={isActionLoading}
          >
            {isActionLoading ? "Cancelling..." : "Yes, Cancel it"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
