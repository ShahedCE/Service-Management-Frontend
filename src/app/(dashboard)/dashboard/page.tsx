"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, RefreshCcw, AlertCircle, Plus } from "lucide-react";
import { PiLightning, PiShieldCheck, PiWarningCircle, PiProhibit } from "react-icons/pi";
import { motion } from "framer-motion";
import { RequestsService, ServiceRequest, RequestStats } from "@/services/requests.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [statsData, setStatsData] = useState<RequestStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("LOW");

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

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) return;
    
    setIsSubmitting(true);
    try {
      const newReq = await RequestsService.createRequest({
        title: newTitle,
        description: newDescription,
        priority: newPriority,
      });
      // Prepend the new request to the list immediately
      setRequests((prev) => [newReq, ...prev]);
      
      // Update local stats
      setStatsData((prev) => prev ? {
        ...prev,
        total: prev.total + 1,
        active: prev.active + 1
      } : null);

      setIsDialogOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewPriority("LOW");
    } catch (err) {
      console.error("Failed to create request", err);
      alert("Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { label: "ACTIVE", value: statsData?.active ?? 0, icon: PiLightning, color: "bg-blue-100 text-blue-600", borderColor: "border-transparent" },
    { label: "COMPLETED", value: statsData?.completed ?? 0, icon: PiShieldCheck, color: "bg-orange-100 text-orange-600", borderColor: "border-transparent" },
    { label: "FAILED", value: statsData?.failed ?? 0, icon: PiWarningCircle, color: "bg-red-100 text-red-600", borderColor: "border-transparent" },
    { label: "CANCELLED", value: statsData?.cancelled ?? 0, icon: PiProhibit, color: "bg-slate-100 text-slate-600", borderColor: "border-transparent" },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PROCESSING": return "bg-indigo-100 text-indigo-700";
      case "QUEUED": return "bg-slate-100 text-slate-700";
      case "COMPLETED": return "bg-slate-50 text-slate-700";
      case "FAILED": return "bg-red-100 text-red-700";
      case "CANCELLED": return "bg-slate-100 text-slate-600";
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
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 h-12 shadow-sm font-medium shrink-0">
              <Plus className="mr-2 h-5 w-5" />
              Create Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreateRequest}>
              <DialogHeader>
                <DialogTitle>Create New Request</DialogTitle>
                <DialogDescription>
                  Enter the details for the new service request. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="E.g. Database migration"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Detailed description of the issue or request..."
                    required
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newPriority} onValueChange={setNewPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Request"}
                </Button>
              </DialogFooter>
            </form>
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
        {!loading && requests.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground">No requests found.</div>
        )}
        {requests.map((req, i) => {
          const type = getReqType(req.status);
          const shortId = `#REQ-${req.id.substring(0, 8).toUpperCase()}`;
          return (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + (i * 0.05) }}
              className="bg-card rounded-2xl p-6 shadow-sm border border-border/40 hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Top row */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md">
                  {shortId}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${getStatusStyle(req.status)}`}>
                  {req.status === "PROCESSING" && <RefreshCcw size={10} className="animate-spin" />}
                  {req.status === "FAILED" && <AlertCircle size={10} />}
                  {req.status === "QUEUED" && <Clock size={10} />}
                  {req.status === "COMPLETED" && <CheckCircle size={10} />}
                  {req.status === "CANCELLED" && <XCircle size={10} />}
                  {req.status}
                </span>
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
                    {type === "progress" ? "Progress" : type === "wait" ? "Status" : type === "runtime" ? "Status" : "Error"}
                  </span>
                  <span className={type === "error" ? "text-red-600" : type === "progress" ? "text-indigo-600" : "text-foreground"}>
                    {type === "progress" ? `${req.progress}%` : type === "error" ? "Failed" : "Done"}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${type === "error" ? "bg-red-500" :
                        type === "progress" ? "bg-indigo-600" :
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
