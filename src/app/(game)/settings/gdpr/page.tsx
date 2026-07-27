"use client";

import { useEffect, useState } from "react";
import { Download, Trash2, Edit3, AlertTriangle, Clock, CheckCircle, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  requestDataExportAction,
  requestDataDeletionAction,
  requestDataCorrectionAction,
  exportUserDataAction,
} from "@/app/actions/gdpr.actions";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "uncommon" | "legendary" | "cursed"; icon: any }> = {
  pending: { label: "Čakajúce", variant: "default", icon: Clock },
  processing: { label: "Spracováva sa", variant: "legendary", icon: Clock },
  completed: { label: "Dokončené", variant: "uncommon", icon: CheckCircle },
  rejected: { label: "Zamietnuté", variant: "cursed", icon: AlertTriangle },
};

export default function GdprPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [requestingExport, setRequestingExport] = useState(false);
  const [requestingDeletion, setRequestingDeletion] = useState(false);
  const [requestingCorrection, setRequestingCorrection] = useState(false);
  const [correctionNotes, setCorrectionNotes] = useState("");
  const [showDeletionConfirm, setShowDeletionConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(false);
    }
    load();
  }, []);

  async function handleExportData() {
    setExporting(true);
    try {
      const result = await exportUserDataAction();
      if (result.success && result.data) {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      }
    } finally {
      setExporting(false);
    }
  }

  async function handleRequestExport() {
    setRequestingExport(true);
    try {
      await requestDataExportAction();
    } finally {
      setRequestingExport(false);
    }
  }

  async function handleRequestDeletion() {
    setRequestingDeletion(true);
    try {
      await requestDataDeletionAction();
      setShowDeletionConfirm(false);
    } finally {
      setRequestingDeletion(false);
    }
  }

  async function handleRequestCorrection() {
    if (!correctionNotes.trim()) return;
    setRequestingCorrection(true);
    try {
      await requestDataCorrectionAction(correctionNotes.trim());
      setCorrectionNotes("");
    } finally {
      setRequestingCorrection(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="GDPR Nastavenia"
        subtitle="Spravuj svoje osobné údaje"
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        {requests.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
              Existujúce požiadavky
            </h3>
            <div className="space-y-2">
              {requests.map((req: any) => {
                const status = STATUS_MAP[req.status] || STATUS_MAP.pending;
                const StatusIcon = status.icon;
                return (
                  <Card key={req.id}>
                    <CardContent className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StatusIcon className="h-4 w-4 text-[#64748b]" />
                        <div>
                          <p className="text-sm font-medium text-[#e2e8f0]">
                            {req.type === "export" && "Export údajov"}
                            {req.type === "deletion" && "Vymazanie údajov"}
                            {req.type === "correction" && "Oprava údajov"}
                          </p>
                          <p className="text-[10px] text-[#64748b]">
                            {new Date(req.created_at).toLocaleDateString("sk")}
                          </p>
                        </div>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#121a2e] border border-[#3b82f6]/30">
                <Download className="h-5 w-5 text-[#60a5fa]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#e2e8f0]">Export údajov</h3>
                <p className="text-[10px] text-[#64748b]">
                  Stiahni si kópiu všetkých svojich údajov
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                loading={exporting}
                onClick={handleExportData}
              >
                <Download className="h-4 w-4" />
                Stiahnuť teraz
              </Button>
              <Button
                variant="secondary"
                size="sm"
                loading={requestingExport}
                onClick={handleRequestExport}
              >
                <FileText className="h-4 w-4" />
                Požiadať o export
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#2a1215] border border-[#dc2626]/30">
                <Trash2 className="h-5 w-5 text-[#f87171]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#e2e8f0]">Vymazanie údajov</h3>
                <p className="text-[10px] text-[#64748b]">
                  Požiadaj o trvalé vymazanie všetkých osobných údajov
                </p>
              </div>
            </div>
            <div className="bg-[#2a1215] border border-[#5c2a2e] rounded-sm p-3 mb-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-[#f87171] mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-[#fca5a5]">
                  Táto akcia je nevratná. Všetky tvoje údaje, pokrok a nákupy budú natrvalo vymazané.
                </p>
              </div>
            </div>
            {showDeletionConfirm ? (
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  loading={requestingDeletion}
                  onClick={handleRequestDeletion}
                >
                  <Trash2 className="h-4 w-4" />
                  Áno, vymazať všetko
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeletionConfirm(false)}
                >
                  Zrušiť
                </Button>
              </div>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeletionConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
                Požiadať o vymazanie
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1e122e] border border-[#a855f7]/30">
                <Edit3 className="h-5 w-5 text-[#c084fc]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#e2e8f0]">Oprava údajov</h3>
                <p className="text-[10px] text-[#64748b]">
                  Požiadaj o opravu nepresných osobných údajov
                </p>
              </div>
            </div>
            <textarea
              className="w-full bg-[#0a0a0f] border border-[#3a3a5c] rounded-sm px-3 py-2 text-sm text-[#e2e8f0] placeholder:text-[#4a4a6c] focus:outline-none focus:ring-1 focus:ring-[#6366f1] min-h-[80px] resize-none"
              placeholder="Opíš, aké údaje majú byť opravené..."
              value={correctionNotes}
              onChange={(e) => setCorrectionNotes(e.target.value)}
            />
            <Button
              variant="primary"
              size="sm"
              className="mt-2"
              loading={requestingCorrection}
              onClick={handleRequestCorrection}
              disabled={!correctionNotes.trim()}
            >
              <Edit3 className="h-4 w-4" />
              Odoslať žiadosť
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
