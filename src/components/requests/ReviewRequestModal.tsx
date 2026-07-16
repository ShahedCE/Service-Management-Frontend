"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RequestsService, ServiceRequest } from "@/services/requests.service";
import { mutate } from "swr";

interface ReviewRequestModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  request: ServiceRequest | null;
  onCancel?: (req: ServiceRequest) => void;
}

export function ReviewRequestModal({ isOpen, setIsOpen, request, onCancel }: ReviewRequestModalProps) {
  const [reviewComment, setReviewComment] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const handleReviewAction = async (action: "approve" | "reject") => {
    if (!request) return;

    if (action === "reject" && !reviewComment.trim()) {
      setActionError("A reason is required to reject a request.");
      return;
    }

    setIsActionLoading(true);
    setActionError("");

    try {
      if (action === "approve") {
        await RequestsService.approveRequest(request.id);
      } else {
        await RequestsService.rejectRequest(request.id, reviewComment);
      }
      
      // Update local SWR cache for the list and stats
      mutate("/requests");
      mutate("/requests/stats");

      setIsOpen(false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(error.response?.data?.message || `Failed to ${action} request.`);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-6 text-white">
          <DialogTitle className="text-xl font-bold tracking-tight">Review Request</DialogTitle>
          <DialogDescription className="text-indigo-100 mt-1.5 text-xs leading-relaxed">
            Review the details below and take appropriate action.
          </DialogDescription>
        </div>

        {request && (
          <div className="px-6 py-5 space-y-5 bg-card">
            <div>
              <h4 className="text-sm font-semibold text-foreground/80 mb-1">Request Title</h4>
              <p className="text-base font-medium text-foreground">{request.title}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground/80 mb-1">Description</h4>
              <div className="bg-secondary/30 p-3 rounded-xl border border-border/50 text-sm text-foreground/90 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {request.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground/80 mb-1">Priority</h4>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 shadow-sm">
                  {request.priority}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground/80 mb-1">Requeue Count</h4>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-orange-50 text-orange-700 rounded-md border border-orange-200 shadow-sm">
                  {request.requeueCount} / 3
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground/80 mb-2">Review Comment <span className="text-muted-foreground font-normal">(Required for Reject)</span></h4>
              <Textarea
                placeholder="Enter a reason if you plan to reject..."
                className="resize-none rounded-xl bg-secondary/30 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 border-border/50 shadow-inner min-h-[80px]"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>

            {actionError && (
              <div className="text-red-600 text-[13px] font-medium bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                {actionError}
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 mt-2 border-t border-border/50">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isActionLoading}
                className="rounded-xl border-slate-300 hover:bg-slate-100 text-slate-700 font-medium sm:w-1/4"
              >
                Back
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:ml-auto">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    // Slight delay to allow Review modal to close before opening Cancel modal
                    setTimeout(() => onCancel?.(request!), 150);
                  }}
                  disabled={isActionLoading}
                  className="rounded-xl font-medium gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Cancel Request
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReviewAction("reject")}
                  disabled={isActionLoading}
                  className="rounded-xl font-medium gap-1.5 active:scale-95 transition-transform bg-red-600 hover:bg-red-700"
                >
                  <XCircle size={16} /> Reject
                </Button>
                <Button
                  onClick={() => handleReviewAction("approve")}
                  disabled={isActionLoading}
                  className="rounded-xl font-medium gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-transform"
                >
                  <CheckCircle size={16} /> Approve
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
