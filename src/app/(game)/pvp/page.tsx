"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swords, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { findOpponents, attackOpponent, getMyRating, getBattleReports } from "@/app/actions/pvp.actions";

const LEAGUE_COLORS: Record<string, string> = {
  tieň: "text-[#94a3b8]",
  železo: "text-[#a8a8a8]",
  krv: "text-[#dc2626]",
  mesiac: "text-[#3b82f6]",
  prastarý: "text-[#a855f7]",
  "vládca_noci": "text-[#f59e0b]",
};

const LEAGUE_THRESHOLDS = [
  { name: "tieň", min: 0 },
  { name: "železo", min: 800 },
  { name: "krv", min: 1000 },
  { name: "mesiac", min: 1200 },
  { name: "prastarý", min: 1500 },
  { name: "vládca_noci", min: 1800 },
];

export default function PvpPage() {
  const [ratingData, setRatingData] = useState<any>(null);
  const [opponents, setOpponents] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [attacking, setAttacking] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [ratingRes, oppRes, reportRes] = await Promise.all([
        getMyRating(),
        findOpponents(),
        getBattleReports("pvp", 1),
      ]);
      if (ratingRes.success) setRatingData(ratingRes.data);
      if (oppRes.success) setOpponents(oppRes.data?.opponents || []);
      if (reportRes.success) setReports(reportRes.data?.reports || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleAttack(defenderId: string) {
    setAttacking(defenderId);
    try {
      const result = await attackOpponent(defenderId);
      if (result.success) {
        const [ratingRes, oppRes, reportRes] = await Promise.all([
          getMyRating(),
          findOpponents(),
          getBattleReports("pvp", 1),
        ]);
        if (ratingRes.success) setRatingData(ratingRes.data);
        if (oppRes.success) setOpponents(oppRes.data?.opponents || []);
        if (reportRes.success) setReports(reportRes.data?.reports || []);
      }
    } finally {
      setAttacking(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const league = ratingData?.league || "tieň";
  const rating = ratingData?.rating || 1000;

  const currentIdx = LEAGUE_THRESHOLDS.findIndex((l) => l.name === league);
  const nextLeague = LEAGUE_THRESHOLDS[currentIdx + 1];
  const leagueProgress = nextLeague
    ? ((rating - LEAGUE_THRESHOLDS[currentIdx].min) / (nextLeague.min - LEAGUE_THRESHOLDS[currentIdx].min)) * 100
    : 100;

  return (
    <div className="animate-fade-in">
      <PageHeader title="PvP Aréna" subtitle="Meraj sa s ostatnými hráčmi" />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-[#64748b]">Hodnotenie</p>
                <p className="text-2xl font-bold text-[#e2e8f0] tabular-nums">
                  {rating}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="default">
                  <span className={LEAGUE_COLORS[league] || "text-[#94a3b8]"}>
                    {league}
                  </span>
                </Badge>
              </div>
            </div>
            {nextLeague && (
              <div>
                <div className="flex items-center justify-between text-[10px] text-[#4a4a6c] mb-1">
                  <span>{league}</span>
                  <span>{nextLeague.name}</span>
                </div>
                <Progress variant="xp" value={leagueProgress} />
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
            Potenciálni súperi
          </h3>
          {opponents.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-xs text-[#64748b]">
                  Žiadni vhodní súperi. Skús neskôr.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {opponents.map((opp) => (
                <Card key={opp.id}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#e2e8f0] truncate">
                          {opp.name}
                        </span>
                        <Badge variant="default">Úr. {opp.level}</Badge>
                      </div>
                      <p className="text-[10px] text-[#64748b] mt-0.5">
                        {opp.league} · {opp.rating} rating
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={attacking === opp.id}
                      onClick={() => handleAttack(opp.id)}
                    >
                      <Swords className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {reports.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
              Posledné súboje
            </h3>
            <div className="space-y-2">
              {reports.slice(0, 5).map((report: any) => {
                const isWin = report.result?.winner === "attacker";
                const attackerName = report.attacker?.name ?? "Neznámy";
                const defenderName = report.defender?.name ?? "Neznámy";
                return (
                  <Link key={report.id} href={`/pvp/${report.id}`}>
                    <Card className="hover:bg-[#1a1a2e] transition-colors cursor-pointer">
                      <CardContent className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-[#e2e8f0]">
                            {attackerName} vs {defenderName}
                          </p>
                          <p className="text-[10px] text-[#64748b]">
                            {new Date(report.created_at).toLocaleDateString("sk")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={isWin ? "uncommon" : "cursed"}>
                            {isWin ? "Výhra" : "Prehra"}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-[#4a4a6c]" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
