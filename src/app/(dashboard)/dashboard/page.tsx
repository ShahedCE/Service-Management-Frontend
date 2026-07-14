"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, RefreshCcw, AlertCircle, Plus } from "lucide-react";
import { PiLightning, PiShieldCheck, PiWarningCircle, PiProhibit } from "react-icons/pi";
import { motion } from "framer-motion";
import { RequestsService, ServiceRequest, RequestStats } from "@/services/requests.service";
import { useSearchStore } from "@/store/search.store";
import { useSocketStore } from "@/store/socket.store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const requestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title is too long."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(1000, "Description is too long."),
  priority: z.string().min(1, "Priority is required."),
});

type RequestFormValues = z.infer<typeof requestSchema>;

export default function DashboardPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [statsData, setStatsData] = useState<RequestStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { query } = useSearchStore();

  const filteredRequests = requests.filter(req => {
    if (!query) return true;
    const lowerQ = query.toLowerCase();
    const shortId = `req-${req.id.substring(0, 8).toLowerCase()}`;
    return req.title.toLowerCase().includes(lowerQ) ||
      req.status.toLowerCase().includes(lowerQ) ||
      shortId.includes(lowerQ);
  });

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "LOW",
    },
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

    // Check URL for ?new=true to open dialog
    const checkQuery = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("new") === "true") {
          setIsDialogOpen(true);
          // Remove param without reloading
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    checkQuery();
    window.addEventListener("popstate", checkQuery);
    return () => window.removeEventListener("popstate", checkQuery);
  }, []);

  const { socket } = useSocketStore();

  useEffect(() => {
    if (!socket) return;

    const handleCreated = (req: ServiceRequest) => {
      setRequests((prev) => {
        // Prevent duplicate addition
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

  const onSubmit = async (data: RequestFormValues) => {
    setIsSubmitting(true);
    try {
      const newReq = await RequestsService.createRequest(data);
      // Prepend the new request to the list immediately
      setRequests((prev) => [newReq, ...prev]);

      // Update local stats
      setStatsData((prev) => prev ? {
        ...prev,
        total: prev.total + 1,
        active: prev.active + 1
      } : null);

      setIsDialogOpen(false);
      form.reset();
    } catch (err) {
      console.error("Failed to create request", err);
      alert("Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { label: "ACTIVE", value: statsData?.active ?? 0, icon: PiLightning, color: "bg-blue-100 text-blue-600", borderColor: "border-transparent" },
    { label: "COMPLETED", value: statsData?.completed ?? 0, icon: PiShieldCheck, color: "bg-emerald-100 text-emerald-600", borderColor: "border-transparent" },
    { label: "FAILED", value: statsData?.failed ?? 0, icon: PiWarningCircle, color: "bg-red-100 text-red-600", borderColor: "border-transparent" },
    { label: "CANCELLED", value: statsData?.cancelled ?? 0, icon: PiProhibit, color: "bg-slate-100 text-slate-600", borderColor: "border-transparent" },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-gray-100 text-gray-800";
      case "QUEUED": return "bg-blue-100 text-blue-800";
      case "PROCESSING": return "bg-amber-100 text-amber-800";
      case "READY_FOR_REVIEW": return "bg-purple-100 text-purple-800";
      case "APPROVED": return "bg-emerald-100 text-emerald-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      case "REQUEUED": return "bg-orange-100 text-orange-800";
      case "FAILED": return "bg-red-700 text-white";
      case "CANCELLED": return "bg-slate-100 text-slate-800";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getReqType = (status: string) => {
    if (status === "FAILED") return "error";
    if (status === "COMPLETED" || status === "CANCELLED") return "runtime";
    if (status === "QUEUED") return "wait";
    return "progress";
  };

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 h-12 shadow-sm shadow-indigo-200 hover:shadow-indigo-300 font-medium shrink-0 transition-all hover:scale-105 active:scale-95 duration-200">
              <Plus className="mr-2 h-5 w-5" />
              Create Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-6 text-white">
              <DialogTitle className="text-xl font-bold tracking-tight">Create New Request</DialogTitle>
              <DialogDescription className="text-indigo-100 mt-1.5 text-xs leading-relaxed">
                Provide detailed information about the service required. A clear description helps supervisors process it faster.
              </DialogDescription>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-5 space-y-5 bg-card">

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground/80">Request Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Server Maintenance Required"
                          className="h-11 rounded-xl bg-secondary/30 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 border-border/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground/80">Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the issue, required resources, and impact..."
                          className="min-h-[100px] rounded-xl bg-secondary/30 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 border-border/50 resize-none transition-all duration-200 focus:bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground/80">Priority Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl bg-secondary/30 focus-visible:ring-indigo-600 focus-visible:ring-offset-0 border-border/50">
                            <SelectValue placeholder="Select a priority level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-border/50 shadow-xl">
                          <SelectItem value="LOW">Low - Routine</SelectItem>
                          <SelectItem value="MEDIUM">Medium - Important</SelectItem>
                          <SelectItem value="HIGH">High - Urgent</SelectItem>
                          <SelectItem value="CRITICAL">Critical - Immediate Action</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 flex justify-end gap-3 border-t border-border/50">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsDialogOpen(false)}
                    className="rounded-xl font-medium hover:bg-secondary transition-all hover:scale-105 active:scale-95 duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 shadow-md shadow-indigo-200 hover:shadow-lg transition-all hover:scale-105 active:scale-95 duration-200"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
              className="bg-card rounded-2xl p-6 shadow-sm border border-border/40 hover:shadow-xl transition-all duration-100 flex flex-col"
            >
              {/* Top row */}
              <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md h-fit">
                  {shortId}
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${getStatusStyle(req.status)}`}>
                    {req.status === "PROCESSING" && <RefreshCcw size={10} className="animate-spin" />}
                    {req.status === "FAILED" && <AlertCircle size={10} />}
                    {req.status === "QUEUED" && <Clock size={10} />}
                    {req.status === "COMPLETED" && <CheckCircle size={10} />}
                    {req.status === "CANCELLED" && <XCircle size={10} />}
                    {req.status}
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
                    {type === "progress" ? "Progress" : type === "wait" ? "Status" : type === "runtime" ? "Status" : "Status"}
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
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
