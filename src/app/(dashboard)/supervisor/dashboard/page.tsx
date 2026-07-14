"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle, RefreshCcw, AlertCircle } from "lucide-react";
import { PiLightning, PiShieldCheck, PiWarningCircle, PiProhibit } from "react-icons/pi";
import { motion } from "framer-motion";
import { RequestsService, ServiceRequest, RequestStats } from "@/services/requests.service";
import { useSearchStore } from "@/store/search.store";

export default function SupervisorDashboardPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [statsData, setStatsData] = useState<RequestStats | null>(null);
  const [loading, setLoading] = useState(true);

  const { query } = useSearchStore();

  const filteredRequests = requests.filter(req => {
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

  const stats = [
    { label: "TOTAL ACTIVE", value: statsData?.active ?? 0, icon: PiLightning, color: "bg-blue-100 text-blue-600", borderColor: "border-transparent" },
    { label: "ALL COMPLETED", value: statsData?.completed ?? 0, icon: PiShieldCheck, color: "bg-orange-100 text-orange-600", borderColor: "border-transparent" },
    { label: "TOTAL FAILURES", value: statsData?.failed ?? 0, icon: PiWarningCircle, color: "bg-red-100 text-red-600", borderColor: "border-transparent" },
    { label: "TOTAL CANCELLED", value: statsData?.cancelled ?? 0, icon: PiProhibit, color: "bg-slate-100 text-slate-600", borderColor: "border-transparent" },
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
