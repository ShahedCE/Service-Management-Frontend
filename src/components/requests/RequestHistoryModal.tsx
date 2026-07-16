"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { RequestsService, StatusHistory } from "@/services/requests.service";

interface RequestHistoryModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  requestId: string;
}

export function RequestHistoryModal({ isOpen, setIsOpen, requestId }: RequestHistoryModalProps) {
  const [historyData, setHistoryData] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && requestId) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const data = await RequestsService.getHistory(requestId);
          setHistoryData(data);
        } catch (error) {
          console.error("Failed to fetch history", error);
          setHistoryData([]);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, requestId]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 px-6 py-6 text-white">
          <DialogTitle className="text-xl font-bold tracking-tight">Status History</DialogTitle>
          <DialogDescription className="text-slate-300 mt-1.5 text-xs leading-relaxed">
            Complete audit trail for #{requestId?.substring(0, 8).toUpperCase()}
          </DialogDescription>
        </div>
        
        <div className="px-6 py-5 bg-card max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading history...</div>
          ) : historyData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No history found.</div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-5">
                {historyData.map((entry) => (
                  <div key={entry.id} className="flex gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-indigo-400 flex items-center justify-center shrink-0 z-10 dark:bg-indigo-900 dark:border-indigo-600">
                      <Clock size={14} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 bg-secondary/30 rounded-xl p-3 border border-border/50">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {entry.oldStatus && (
                          <>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{entry.oldStatus}</span>
                            <span className="text-muted-foreground text-xs">→</span>
                          </>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">{entry.newStatus}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                        <span>By: <strong className="text-foreground">{entry.changedBy?.name || entry.changedByType}</strong></span>
                        <span>{new Date(entry.changedAt).toLocaleString()}</span>
                      </div>
                      {entry.comment && (
                        <div className="mt-2 text-xs bg-background/50 p-2 rounded border border-border/30">
                          <span className="font-semibold text-foreground/80">Remarks:</span> {entry.comment}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
