"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PiLightning, PiShieldCheck, PiWarningCircle, PiProhibit } from "react-icons/pi";
import { motion } from "framer-motion";
import { RequestsService, ServiceRequest } from "@/services/requests.service";
import { useSearchStore } from "@/store/search.store";
import { useSocketStore } from "@/store/socket.store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSWR, { mutate } from "swr";

// Extracted Components
import { CreateRequestModal } from "@/components/requests/CreateRequestModal";
import { EditRequestModal } from "@/components/requests/EditRequestModal";
import { RequestHistoryModal } from "@/components/requests/RequestHistoryModal";
import { RequestCard } from "@/components/requests/RequestCard";
import { useAuthStore } from "@/store/auth.store";
import { Pencil, Clock } from "lucide-react";



export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editRequest, setEditRequest] = useState<ServiceRequest | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyRequestId, setHistoryRequestId] = useState("");

  const { query } = useSearchStore();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // SWR for data fetching
  const { data: response, isLoading: loadingRequests } = useSWR(
    ["/requests", currentPage, query, statusFilter],
    () => RequestsService.getRequests({
      page: currentPage,
      limit: itemsPerPage,
      ...(query && { search: query }),
      ...(statusFilter !== "ALL" && { status: statusFilter }),
    })
  );

  const { data: statsData, isLoading: loadingStats } = useSWR("/requests/stats", RequestsService.getStats);

  const [localRequests, setLocalRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    if (response?.data) {
      setLocalRequests(response.data);
    }
  }, [response?.data]);

  const currentRequests = localRequests;
  const meta = response?.meta || { totalItems: 0, totalPages: 1 };
  const totalItems = meta.totalItems;
  const totalPages = meta.totalPages;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };



  // Socket.io Real-time Updates
  const { socket } = useSocketStore();

  useEffect(() => {
    if (!socket) return;

    const revalidateList = () => {
      mutate(
        (key: unknown) => (Array.isArray(key) && key[0] === "/requests") || key === "/requests/stats" || key === "/requests",
        undefined,
        { revalidate: true }
      );
    };

    const updateProgressInList = (payload: { requestId: string; progress: number }) => {
      setLocalRequests(prev => prev.map(r => r.id === payload.requestId ? { ...r, progress: payload.progress } : r));
    };

    const updateRequestStatus = (payload: { requestId: string }, status: ServiceRequest['status']) => {
      setLocalRequests(prev => prev.map(r => r.id === payload.requestId ? { ...r, status: status } : r));
    };

    const handleQueued = (p: { requestId: string }) => updateRequestStatus(p, "QUEUED");
    const handleProcessing = (p: { requestId: string }) => updateRequestStatus(p, "PROCESSING");

    socket.on("requestCreated", revalidateList);
    socket.on("requestQueued", handleQueued);
    socket.on("requestProcessing", handleProcessing);
    socket.on("requestReadyForReview", revalidateList);
    socket.on("requestCompleted", revalidateList);
    socket.on("requestFailed", revalidateList);
    socket.on("requestCancelled", revalidateList);
    socket.on("requestRequeued", revalidateList);
    socket.on("requestProgressUpdated", updateProgressInList);

    return () => {
      socket.off("requestCreated", revalidateList);
      socket.off("requestQueued", handleQueued);
      socket.off("requestProcessing", handleProcessing);
      socket.off("requestReadyForReview", revalidateList);
      socket.off("requestCompleted", revalidateList);
      socket.off("requestFailed", revalidateList);
      socket.off("requestCancelled", revalidateList);
      socket.off("requestRequeued", revalidateList);
      socket.off("requestProgressUpdated", updateProgressInList);
    };
  }, [socket]);

  const { user } = useAuthStore();

  const handleEditOpen = (req: ServiceRequest) => {
    setEditRequest(req);
    setIsEditOpen(true);
  };

  const handleHistoryOpen = (reqId: string) => {
    setHistoryRequestId(reqId);
    setIsHistoryOpen(true);
  };

  const stats = [
    { label: "ACTIVE", value: statsData?.active ?? 0, icon: PiLightning, color: "bg-blue-100 text-blue-600", borderColor: "border-transparent" },
    { label: "COMPLETED", value: statsData?.completed ?? 0, icon: PiShieldCheck, color: "bg-emerald-100 text-emerald-600", borderColor: "border-transparent" },
    { label: "FAILED", value: statsData?.failed ?? 0, icon: PiWarningCircle, color: "bg-red-100 text-red-600", borderColor: "border-transparent" },
    { label: "CANCELLED", value: statsData?.cancelled ?? 0, icon: PiProhibit, color: "bg-slate-100 text-slate-600", borderColor: "border-transparent" },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">My Requests</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Real-time oversight of current operational flow and service status.
          </p>
        </div>
        <CreateRequestModal />
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
                {loadingStats ? "..." : stat.value}
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
          <Select value={statusFilter} onValueChange={(val) => {
            setStatusFilter(val);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-full sm:w-[200px] rounded-xl bg-card border-border/50">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 shadow-xl max-h-[300px]">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
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
        {loadingRequests && <div className="col-span-full py-10 text-center text-muted-foreground">Loading requests...</div>}
        {!loadingRequests && totalItems === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            No requests found matching your filters.
          </div>
        )}
        {currentRequests.map((req, i) => (
          <RequestCard 
            key={req.id} 
            request={req} 
            index={i} 
          >
            {user && ["PENDING", "QUEUED", "PROCESSING", "REQUEUED"].includes(req.status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleEditOpen(req); }}
                className="rounded-xl text-xs font-medium gap-1.5 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
              >
                <Pencil size={12} /> Edit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleHistoryOpen(req.id); }}
              className="rounded-xl text-xs font-medium gap-1.5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Clock size={12} /> History
            </Button>
          </RequestCard>
        ))}
      </div>

      {/* Pagination */}
      {!loadingRequests && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to <span className="font-semibold text-foreground">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="font-semibold text-foreground">{totalItems}</span> requests
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevPage} disabled={currentPage === 1} className="h-9 w-9 rounded-lg border-border/50 bg-secondary/30">
              <ChevronLeft size={16} />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 text-muted-foreground">...</span>}
                    <Button 
                      variant={page === currentPage ? "default" : "ghost"} 
                      onClick={() => setCurrentPage(page)} 
                      className={`h-9 w-9 rounded-lg ${page === currentPage ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {page}
                    </Button>
                  </div>
              ))}
            </div>

            <Button variant="outline" size="icon" onClick={handleNextPage} disabled={currentPage === totalPages} className="h-9 w-9 rounded-lg border-border/50 bg-secondary/30">
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditRequestModal isOpen={isEditOpen} setIsOpen={setIsEditOpen} request={editRequest} />
      <RequestHistoryModal isOpen={isHistoryOpen} setIsOpen={setIsHistoryOpen} requestId={historyRequestId} />
    </div>
  );
}
