"use client";

import { useEffect, useState, use } from "react";
import { Swords } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getBattleReport } from "@/app/actions/pvp.actions";

export default function PvpReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = use(params);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getBattleReport(reportId);
      if (result.success) setReport(result.data?.report);
      setLoading(false);
    }
    load();
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-4 text-center text-sm text-[#64748b] py-20">
        Záznam nenájdený.
      </div>
    );
  }

  const attackerSnapshot = report.attacker_snapshot;
  const defenderSnapshot = report.defender_snapshot;
  const result = report.result as { winner?: string; ratingChange?: number; totalAttackerDamage?: number; totalDefenderDamage?: number } | undefined;
  const isVictory = result?.winner === "attacker";
  const ratingChange = result?.ratingChange ?? 0;
  const attackerName = report.attacker?.name ?? attackerSnapshot?.name ?? "Neznámy";
  const defenderName = report.defender?.name ?? defenderSnapshot?.name ?? "Neznámy";
  const attackerLevel = report.attacker?.level ?? attackerSnapshot?.level ?? "?";
  const defenderLevel = report.defender?.level ?? defenderSnapshot?.level ?? "?";
  const attackerRating = report.attacker?.pvp_rating ?? "?";
  const defenderRating = report.defender?.pvp_rating ?? "?";

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Záznam súboja"
        subtitle={`${attackerName} vs ${defenderName}`}
        onBack={() => window.history.back()}
      />

      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <Card variant={isVictory ? "success" : "danger"}>
          <CardContent className="py-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-[#64748b] mb-1">Útočník</p>
                <p className="text-sm font-semibold text-[#e2e8f0]">
                  {attackerName}
                </p>
                <p className="text-[10px] text-[#64748b]">
                  {attackerLevel} · {attackerRating}
                </p>
              </div>
              <div className="flex items-center justify-center">
                <Swords className="h-6 w-6 text-[#dc2626]" />
              </div>
              <div>
                <p className="text-xs text-[#64748b] mb-1">Obranca</p>
                <p className="text-sm font-semibold text-[#e2e8f0]">
                  {defenderName}
                </p>
                <p className="text-[10px] text-[#64748b]">
                  {defenderLevel} · {defenderRating}
                </p>
              </div>
            </div>
            <div className="text-center mt-4">
              <Badge variant={isVictory ? "uncommon" : "cursed"} className="text-sm">
                {isVictory ? "VÍŤAZSTVO" : "PORÁŽKA"}
              </Badge>
              <p className="text-xs text-[#94a3b8] mt-2">
                Zmena hodnotenia:{" "}
                <span className={ratingChange > 0 ? "text-[#22c55e]" : "text-[#dc2626]"}>
                  {ratingChange > 0 ? "+" : ""}
                  {ratingChange}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
              Priebeh boja
            </h3>
            <div className="space-y-0">
              {(report.rounds || []).map((round: any, i: number) => (
                <div
                  key={i}
                  className="grid grid-cols-3 gap-2 py-2 border-b border-[#2a2a44]/30 last:border-0 text-[11px]"
                >
                  <span className="text-[#64748b] text-center">
                    Kolo {round.round}
                  </span>
                  <span className="text-[#dc2626] text-center tabular-nums">
                    -{round.defenderDamage ?? 0}
                  </span>
                  <span className="text-[#22c55e] text-center tabular-nums">
                    -{round.attackerDamage ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-[10px] text-[#64748b] mb-1">Sila útočníka</p>
              <p className="text-lg font-bold text-[#e2e8f0] tabular-nums">
                {result?.totalAttackerDamage ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-[10px] text-[#64748b] mb-1">Sila obrancu</p>
              <p className="text-lg font-bold text-[#e2e8f0] tabular-nums">
                {result?.totalDefenderDamage ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
