"use client";

import { Activity, CheckCircle2, AlertCircle, Cpu, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SupervisorDashboardPage() {

  const stats = [
    { label: "TOTAL ACTIVE", value: "84", icon: Activity, color: "bg-blue-100 text-blue-600", borderColor: "border-transparent" },
    { label: "ALL COMPLETED", value: "3,210", icon: CheckCircle2, color: "bg-orange-100 text-orange-600", borderColor: "border-transparent" },
    { label: "CRITICAL FAILURES", value: "12", icon: AlertCircle, color: "bg-red-100 text-red-600", borderColor: "border-transparent" },
    { label: "GLOBAL SYS LOAD", value: "82%", icon: Cpu, color: "bg-indigo-100 text-indigo-600", borderColor: "border-indigo-600", trend: "5%" },
  ];

  const requests = [
    { id: "#REQ-9001", status: "PROCESSING", title: "Global Sync Calibration", desc: "Initiating synchronization of distributed node clusters across th...", type: "progress", value: 45 },
    { id: "#REQ-8992", status: "QUEUED", title: "DB Archeological Cleanup", desc: "Scheduled maintenance for archivi... system logs from Q3-2023 to cold", type: "wait", value: "~14m 20s", pct: 15 },
    { id: "#REQ-8980", status: "COMPLETED", title: "Auth-Gate Redundancy", desc: "Implementation of secondary authentication gates for the core...", type: "runtime", value: "22m 45s", pct: 100 },
    { id: "#REQ-8879", status: "FAILED", title: "Quantum Mesh Patch", desc: "Critical failure during the deployme... of the quantum mesh encryption", type: "error", value: "ERR_QM_500", pct: 80 },
    { id: "#REQ-8868", status: "PROCESSING", title: "Data Lake Indexing v2", desc: "Re-indexing the primary data lake f... optimized query performance across", type: "progress", value: 89 },
    { id: "#REQ-8857", status: "QUEUED", title: "Security Audit Scan", desc: "Automated security audit scan for a... external-facing API endpoints.", type: "wait", value: "~2m 10s", pct: 25 },
  ];

  const getStatusStyle = (status: string) => {
    switch(status) {
      case "PROCESSING": return "bg-indigo-100 text-indigo-700";
      case "QUEUED": return "bg-slate-100 text-slate-700";
      case "COMPLETED": return "bg-slate-50 text-slate-700";
      case "FAILED": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Global Overview</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Real-time oversight of all operational flow and service status across teams.
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
                {stat.trend && <span className="text-indigo-600 flex items-center text-[9px]">▲ {stat.trend}</span>}
              </div>
              <div className="text-3xl font-bold mt-1">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grid of Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {requests.map((req, i) => (
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
                {req.id}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${getStatusStyle(req.status)}`}>
                {req.status === "PROCESSING" && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                {req.status === "FAILED" && <AlertCircle size={10} />}
                {req.status === "QUEUED" && <Clock size={10} />}
                {req.status === "COMPLETED" && <CheckCircle size={10} />}
                {req.status}
              </span>
            </div>

            {/* Title & Desc */}
            <h3 className="text-lg font-bold leading-tight">{req.title}</h3>
            <p className="text-sm text-muted-foreground mt-3 flex-1 line-clamp-3 leading-relaxed">
              {req.desc}
            </p>

            {/* Bottom Progress */}
            <div className="mt-6 pt-4 border-t border-border/50">
              <div className="flex justify-between items-center mb-2 text-xs font-semibold">
                <span className="text-muted-foreground">
                  {req.type === "progress" ? "Progress" : req.type === "wait" ? "Wait Time" : req.type === "runtime" ? "Runtime" : "Error Code"}
                </span>
                <span className={req.type === "error" ? "text-red-600" : req.type === "progress" ? "text-indigo-600" : "text-foreground"}>
                  {req.type === "progress" ? `${req.value}%` : req.value}
                </span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    req.type === "error" ? "bg-red-500" : 
                    req.type === "progress" ? "bg-indigo-600" : 
                    req.type === "runtime" ? "bg-slate-700" : "bg-slate-300"
                  }`}
                  style={{ width: `${req.type === "progress" ? req.value : req.pct}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
    </div>
  );
}
