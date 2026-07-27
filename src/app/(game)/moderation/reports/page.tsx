"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getPendingReportsAction,
  reviewReportAction,
  dismissReportAction,
  getReportStatsAction,
  getModerationHistoryAction,
} from "@/app/actions/moderation.actions";

const MODERATION_ACTIONS = [
  { value: "warning", label: "Upozornenie" },
  { value: "mute", label: "Mlčať" },
  { value: "ban", label: "Ban" },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState("warning");
  const [resolution, setResolution] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    const [reportsRes, statsRes] = await Promise.all([
      getPendingReportsAction(),
      getReportStatsAction(),
    ]);
    if (reportsRes.success) setReports(reportsRes.data || []);
    if (statsRes.success) setStats(statsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleReview(reportId: string) {
    setProcessing(reportId);
    try {
      const res = await reviewReportAction(reportId, reviewAction, resolution || undefined);
      if (res.success) {
        setSelectedReport(null);
        setResolution("");
        await loadData();
      }
    } finally {
      setProcessing(null);
    }
  }

  async function handleDismiss(reportId: string) {
    setProcessing(reportId);
    try {
      const res = await dismissReportAction(reportId);
      if (res.success) await loadData();
    } finally {
      setProcessing(null);
    }
  }

  async function handleViewHistory(characterId: string) {
    const res = await getModerationHistoryAction(characterId);
    if (res.success) setHistory(res.data || []);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Hlásenia" subtitle="Správa a kontrola hráčskych hlásení" />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Card>
              <CardContent className="py-3 text-center">
                <p className="text-[10px] text-[#4a4a6c] uppercase tracking-wider">Celkom</p>
                <p className="text-xl font-bold text-[#e2e8f0]">{stats.total ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 text-center">
                <p className="text-[10px] text-[#f59e0b] uppercase tracking-wider">Čakajúce</p>
                <p className="text-xl font-bold text-[#f59e0b]">{stats.pending ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 text-center">
                <p className="text-[10px] text-[#22c55e] uppercase tracking-wider">Skontrolované</p>
                <p className="text-xl font-bold text-[#22c55e]">{stats.reviewed ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 text-center">
                <p className="text-[10px] text-[#64748b] uppercase tracking-wider">Zamietnuté</p>
                <p className="text-xl font-bold text-[#64748b]">{stats.dismissed ?? 0}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            Čakajúce hlásenia
          </h3>
          {reports.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-xs text-[#64748b]">Žiadne čakajúce hlásenia.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {reports.map((report: any) => (
                <Card
                  key={report.id}
                  className={
                    selectedReport === report.id ? "border-[#6366f1]" : ""
                  }
                >
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="cursed">{report.reason}</Badge>
                          <span className="text-[10px] text-[#4a4a6c]">
                            {new Date(report.created_at).toLocaleDateString("sk")}
                          </span>
                        </div>
                        <p className="text-xs text-[#e2e8f0]">
                          <span className="text-[#64748b]">Nahlasovateľ:</span>{" "}
                          {report.reporter_name ?? report.reporter?.name ?? "Neznámy"}
                          {" → "}
                          <span className="text-[#64748b]">Hlásený:</span>{" "}
                          {report.reported_name ?? report.reported?.name ?? "Neznámy"}
                        </p>
                        {report.description && (
                          <p className="text-[10px] text-[#64748b] mt-1 line-clamp-2">
                            {report.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setSelectedReport(
                              selectedReport === report.id ? null : report.id
                            )
                          }
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleViewHistory(report.reported_id ?? report.reported?.id)
                          }
                        >
                          <Clock className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {selectedReport === report.id && (
                      <div className="mt-3 pt-3 border-t border-[#2a2a44]">
                        <div className="flex items-center gap-2 mb-2">
                          <select
                            className="text-xs bg-[#1a1a2e] border border-[#2a2a44] text-[#e2e8f0] rounded px-2 py-1"
                            value={reviewAction}
                            onChange={(e) => setReviewAction(e.target.value)}
                          >
                            {MODERATION_ACTIONS.map((a) => (
                              <option key={a.value} value={a.value}>
                                {a.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Poznámka (voliteľné)"
                            className="text-xs bg-[#1a1a2e] border border-[#2a2a44] text-[#e2e8f0] rounded px-2 py-1 flex-1"
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            loading={processing === report.id}
                            onClick={() => handleReview(report.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Spracovať
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={processing === report.id}
                            onClick={() => handleDismiss(report.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Zamietnuť
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
              <BarChart3 className="h-3 w-3 inline mr-1" />
              História moderácie
            </h3>
            <div className="space-y-2">
              {history.map((entry: any) => (
                <Card key={entry.id}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#e2e8f0]">
                        {entry.action_type ?? entry.action ?? "Akcia"}
                      </p>
                      <p className="text-[10px] text-[#64748b]">
                        {entry.resolution || entry.reason || "Bez poznámky"} ·{" "}
                        {new Date(entry.created_at).toLocaleDateString("sk")}
                      </p>
                    </div>
                    <Badge variant={entry.action_type === "ban" ? "cursed" : "default"}>
                      {entry.action_type ?? entry.action ?? "Akcia"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
