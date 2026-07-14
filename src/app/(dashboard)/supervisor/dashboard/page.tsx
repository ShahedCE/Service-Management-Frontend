"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, RefreshCcw, AlertCircle } from "lucide-react";
import { PiLightning, PiShieldCheck, PiWarningCircle, PiProhibit } from "react-icons/pi";
import { motion } from "framer-motion";
import { RequestsService, ServiceRequest, RequestStats } from "@/services/requests.service";
import { useSearchStore } from "@/store/search.store";
import { useSocketStore } from "@/store/socket.store";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getDisplayStatus = (status: string) => {
  if (["PENDING", "QUEUED", "REQUEUED"].includes(status)) return "PROCESSING";
  return status;
};

export default function SupervisorDashboardPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [statsData, setStatsData] = useState<RequestStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Review state
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { query } = useSearchStore();

  const filteredRequests = requests.filter(req => {
    if (statusFilter !== "ALL" && req.status !== statusFilter && getDisplayStatus(req.status) !== statusFilter) return false;
    if (!query) return true;
    const lowerQ = query.toLowerCase();
    const shortId = `req-${req.id.substring(0, 8).toLowerCase()}`;
    return req.title.toLowerCase().includes(lowerQ) ||
      req.status.toLowerCase().includes(lowerQ) ||
      shortId.includes(lowerQ);
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedRequests, fetchedStats] = await Promise.all([
          RequestsService.getRequests(),
          RequestsService.getStats(),
        ]);
        setRequests(fetchedRequests);
        setStatsData(fetchedStats);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { socket } = useSocketStore();

  useEffect(() => {
    if (!socket) return;

    const handleCreated = (req: ServiceRequest) => {
      setRequests((prev) => {
        if (prev.some(r => r.id === req.id)) return prev;
        return [req, ...prev];
      });
      RequestsService.getStats().then(setStatsData);
    };

    const handleUpdated = (req: ServiceRequest) => {
      setRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, ...req } : r));
      RequestsService.getStats().then(setStatsData);
    };

    const handleProgress = (data: { requestId: string; progress: number }) => {
      setRequests((prev) => prev.map((r) => r.id === data.requestId ? { ...r, progress: data.progress } : r));
    };

    socket.on("requestCreated", handleCreated);
    socket.on("requestQueued", handleUpdated);
    socket.on("requestProcessing", handleUpdated);
    socket.on("requestReadyForReview", handleUpdated);
    socket.on("requestCompleted", handleUpdated);
    socket.on("requestFailed", handleUpdated);
    socket.on("requestCancelled", handleUpdated);
    socket.on("requestRequeued", handleUpdated);
    socket.on("requestProgressUpdated", handleProgress);

    return () => {
      socket.off("requestCreated", handleCreated);
      socket.off("requestQueued", handleUpdated);
      socket.off("requestProcessing", handleUpdated);
      socket.off("requestReadyForReview", handleUpdated);
      socket.off("requestCompleted", handleUpdated);
      socket.off("requestFailed", handleUpdated);
      socket.off("requestCancelled", handleUpdated);
      socket.off("requestRequeued", handleUpdated);
      socket.off("requestProgressUpdated", handleProgress);
    };
  }, [socket]);

  const stats = [
    { label: "TOTAL ACTIVE", value: statsData?.active ?? 0, icon: PiLightning, color: "bg-blue-100 text-blue-600", borderColor: "border-transparent" },
    { label: "ALL COMPLETED", value: statsData?.completed ?? 0, icon: PiShieldCheck, color: "bg-emerald-100 text-emerald-600", borderColor: "border-transparent" },
    { label: "TOTAL FAILURES", value: statsData?.failed ?? 0, icon: PiWarningCircle, color: "bg-red-100 text-red-600", borderColor: "border-transparent" },
    { label: "TOTAL CANCELLED", value: statsData?.cancelled ?? 0, icon: PiProhibit, color: "bg-slate-100 text-slate-600", borderColor: "border-transparent" },
  ];

  const getStatusStyle = (status: string) => {
    const s = getDisplayStatus(status);
    switch (s) {
      case "PROCESSING": return "bg-amber-100 text-amber-800";
      case "READY_FOR_REVIEW": return "bg-purple-100 text-purple-800";
      case "APPROVED": return "bg-emerald-100 text-emerald-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      case "FAILED": return "bg-red-700 text-white";
      case "CANCELLED": return "bg-slate-100 text-slate-800";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getReqType = (status: string) => {
    const s = getDisplayStatus(status);
    if (s === "FAILED") return "error";
    if (s === "COMPLETED" || s === "CANCELLED") return "runtime";
    return "progress";
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setIsActionLoading(true);
    setActionError("");
    try {
      await RequestsService.approveRequest(selectedRequest.id);
      setIsReviewOpen(false);
      setReviewComment("");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(error.response?.data?.message || "Failed to approve request.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!reviewComment.trim()) {
      setActionError("Please provide a review comment for rejection.");
      return;
    }
    setIsActionLoading(true);
    setActionError("");
    try {
      await RequestsService.rejectRequest(selectedRequest.id, reviewComment);
      setIsReviewOpen(false);
      setReviewComment("");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(error.response?.data?.message || "Failed to reject request.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedRequest) return;
    setIsActionLoading(true);
    setActionError("");
    try {
      await RequestsService.cancelRequest(selectedRequest.id);
      setIsReviewOpen(false);
      setIsCancelConfirmOpen(false);
      setReviewComment("");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionError(error.response?.data?.message || "Failed to cancel request.");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Global Overview</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Monitor and manage all system requests across the infrastructure.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-card rounded-2xl p-6 shadow-sm border ${stat.borderColor} flex items-center gap-4`}
          >
            <div className={`p-3 rounded-xl ${stat.color} bg-opacity-20`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                {stat.label}
              </div>
              <div className="text-3xl font-bold mt-1">
                {loading ? "..." : stat.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls / Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 mb-4">
        <h2 className="text-xl font-bold tracking-tight">Recent Requests</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Filter by:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px] rounded-xl bg-card border-border/50">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 shadow-xl max-h-[300px]">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="READY_FOR_REVIEW">Ready For Review</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid of Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && <div className="col-span-full py-10 text-center text-muted-foreground">Loading requests...</div>}
        {!loading && filteredRequests.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            {requests.length === 0 ? "No requests found." : "No requests match your search."}
          </div>
        )}
        {filteredRequests.map((req, i) => {
          const type = getReqType(req.status);
          const shortId = `#REQ-${req.id.substring(0, 8).toUpperCase()}`;
          return (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -6 }}
              transition={{ delay: 0.2 + (i * 0.05) }}
              className="bg-card rounded-2xl p-6 shadow-sm border border-border/40 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Top row */}
              <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md h-fit">
                  {shortId}
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${getStatusStyle(req.status)}`}>
                    {getDisplayStatus(req.status) === "PROCESSING" && <RefreshCcw size={10} className="animate-spin" />}
                    {getDisplayStatus(req.status) === "FAILED" && <AlertCircle size={10} />}
                    {getDisplayStatus(req.status) === "COMPLETED" && <CheckCircle size={10} />}
                    {getDisplayStatus(req.status) === "CANCELLED" && <XCircle size={10} />}
                    {getDisplayStatus(req.status)}
                  </span>
                  {["COMPLETED", "FAILED", "CANCELLED"].includes(req.status) ? null : req.requeueCount === 0 ? (
                    <span className="text-[9px] font-bold text-emerald-500 uppercase px-1">New</span>
                  ) : (
                    <span className="text-[9px] font-bold text-orange-500 uppercase px-1">Requeued: {req.requeueCount}</span>
                  )}
                </div>
              </div>

              {/* Title & Desc */}
              <h3 className="text-lg font-bold leading-tight">{req.title}</h3>
              <p className="text-sm text-muted-foreground mt-3 flex-1 line-clamp-3 leading-relaxed">
                {req.description}
              </p>

              {/* Bottom Progress */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="flex justify-between items-center mb-2 text-xs font-semibold">
                  <span className="text-muted-foreground">
                    {type === "progress" ? "Progress" : "Status"}
                  </span>
                  <span className={type === "error" ? "text-red-600" : type === "progress" ? "text-indigo-600" : "text-foreground"}>
                    {type === "progress" ? `${req.progress}%` : type === "error" ? "Failed" : req.status === "CANCELLED" ? "Cancelled" : "Done"}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${type === "error" ? "bg-red-500" :
                      type === "progress" ? "bg-indigo-600" :
                        req.status === "COMPLETED" ? "bg-emerald-500" :
                          type === "runtime" ? "bg-slate-700" : "bg-slate-300"
                      }`}
                    style={{ width: `${type === "progress" ? req.progress : type === "error" ? 100 : type === "runtime" ? 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Review Button */}
              {req.status === "READY_FOR_REVIEW" && (
                <Button
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-200"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent card click if any
                    setSelectedRequest(req);
                    setReviewComment("");
                    setActionError("");
                    setIsReviewOpen(true);
                  }}
                >
                  Go For Review
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-6 text-white">
            <DialogTitle className="text-xl font-bold tracking-tight">Review Request</DialogTitle>
            <DialogDescription className="text-indigo-100 mt-1.5 text-xs leading-relaxed">
              Review the details below and take appropriate action.
            </DialogDescription>
          </div>

          {selectedRequest && (
            <div className="px-6 py-5 space-y-5 bg-card">
              <div>
                <h4 className="text-sm font-semibold text-foreground/80 mb-1">Request Title</h4>
                <p className="text-base font-medium text-foreground">{selectedRequest.title}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground/80 mb-1">Description</h4>
                <div className="bg-secondary/30 p-3 rounded-xl border border-border/50 text-sm text-foreground/90 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {selectedRequest.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground/80 mb-1">Priority</h4>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 shadow-sm">
                    {selectedRequest.priority}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground/80 mb-1">Requeue Count</h4>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-orange-50 text-orange-700 rounded-md border border-orange-200 shadow-sm">
                    {selectedRequest.requeueCount} / 3
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
                  onClick={() => setIsReviewOpen(false)}
                  disabled={isActionLoading}
                  className="rounded-xl border-slate-300 hover:bg-slate-100 text-slate-700 font-medium sm:w-1/4"
                >
                  Back
                </Button>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-3/4 sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsCancelConfirmOpen(true)}
                    disabled={isActionLoading}
                    className="rounded-xl border-red-200 hover:bg-red-50 text-red-600 font-medium w-full sm:w-auto"
                  >
                    Cancel Request
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={isActionLoading}
                    className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium w-full sm:w-auto shadow-md shadow-amber-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={isActionLoading}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium w-full sm:w-auto shadow-md shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Approve
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Warning
          </DialogTitle>
          <DialogDescription className="text-base text-foreground mt-2">
            Are you sure you want to cancel this request? If you cancel, the request will no longer be processed.
          </DialogDescription>
          <DialogFooter className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsCancelConfirmOpen(false)}
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
    </div>
  );
}
