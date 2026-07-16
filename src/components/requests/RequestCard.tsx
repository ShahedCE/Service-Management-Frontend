import { motion } from "framer-motion";
import { ServiceRequest } from "@/services/requests.service";
import { RefreshCcw, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface RequestCardProps {
  request: ServiceRequest;
  index: number;
  children?: React.ReactNode;
}

const getDisplayStatus = (status: string) => {
  if (["PENDING", "QUEUED", "REQUEUED"].includes(status)) return "PROCESSING";
  return status;
};

const getStatusStyle = (status: string) => {
  const s = getDisplayStatus(status);
  switch (s) {
    case "PROCESSING": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    case "READY_FOR_REVIEW": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "APPROVED": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "COMPLETED": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "REJECTED": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "FAILED": return "bg-red-700 text-white";
    case "CANCELLED": return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
};

const getReqType = (status: string) => {
  const s = getDisplayStatus(status);
  if (s === "FAILED") return "error";
  if (s === "COMPLETED" || s === "CANCELLED") return "runtime";
  return "progress";
};

export function RequestCard({ request, index, children }: RequestCardProps) {
  const type = getReqType(request.status);
  const shortId = `#REQ-${request.id.substring(0, 8).toUpperCase()}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6 }}
      transition={{ delay: 0.2 + (index * 0.05) }}
      className="bg-card rounded-2xl p-6 shadow-sm border border-border/40 hover:shadow-xl transition-all duration-100 flex flex-col"
    >
      {/* Top row */}
      <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
        <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md h-fit dark:bg-indigo-950 dark:text-indigo-400">
          {shortId}
        </span>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${getStatusStyle(request.status)}`}>
            {getDisplayStatus(request.status) === "PROCESSING" && <RefreshCcw size={10} className="animate-spin" />}
            {getDisplayStatus(request.status) === "FAILED" && <AlertCircle size={10} />}
            {getDisplayStatus(request.status) === "COMPLETED" && <CheckCircle size={10} />}
            {getDisplayStatus(request.status) === "CANCELLED" && <XCircle size={10} />}
            {getDisplayStatus(request.status)}
          </span>
          {["COMPLETED", "FAILED", "CANCELLED"].includes(request.status) ? null : request.requeueCount === 0 ? (
            <span className="text-[9px] font-bold text-emerald-500 uppercase px-1">New</span>
          ) : (
            <span className="text-[9px] font-bold text-orange-500 uppercase px-1">Requeued: {request.requeueCount}</span>
          )}
        </div>
      </div>

      {/* Title & Desc */}
      <h3 className="text-lg font-bold leading-tight">{request.title}</h3>
      <p className="text-sm text-muted-foreground mt-3 flex-1 line-clamp-3 leading-relaxed">
        {request.description}
      </p>

      {/* Bottom Progress */}
      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="flex justify-between items-center mb-2 text-xs font-semibold">
          <span className="text-muted-foreground">
            {type === "progress" ? "Progress" : "Status"}
          </span>
          <span className={type === "error" ? "text-red-600" : type === "progress" ? "text-indigo-600 dark:text-indigo-400" : "text-foreground"}>
            {type === "progress" ? `${request.progress}%` : type === "error" ? "Failed" : request.status === "CANCELLED" ? "Cancelled" : "Done"}
          </span>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${type === "error" ? "bg-red-500" :
              type === "progress" ? "bg-indigo-600" :
                request.status === "COMPLETED" ? "bg-emerald-500" :
                  type === "runtime" ? "bg-slate-700" : "bg-slate-300"
              }`}
            style={{ width: `${type === "progress" ? request.progress : type === "error" ? 100 : type === "runtime" ? 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      {children && (
        <div className="mt-4 flex flex-wrap gap-2">
          {children}
        </div>
      )}
    </motion.div>
  );
}
