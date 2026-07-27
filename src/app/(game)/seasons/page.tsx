"use client";

import { useEffect, useState, useCallback } from "react";
import { Trophy, Clock, Crown, TrendingUp, Coins, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getActiveSeasonAction,
  getSeasonLeaderboardAction,
  claimSeasonRewardAction,
  getSeasonHistoryAction,
} from "@/app/actions/season.actions";

const BOARD_TABS = [
  { value: "level", label: "Úroveň", icon: TrendingUp },
  { value: "pvp_rating", label: "PvP", icon: Trophy },
  { value: "gold", label: "Zlato", icon: Coins },
  { value: "power", label: "Sila", icon: Zap },
];

export default function SeasonsPage() {
  const [season, setSeason] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeBoard, setActiveBoard] = useState("level");
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const loadData = useCallback(async (boardType: string) => {
    const [seasonRes, historyRes] = await Promise.all([
      getActiveSeasonAction(),
      getSeasonHistoryAction(10),
    ]);
    if (seasonRes.success) setSeason(seasonRes.data);
    if (historyRes.success) setHistory(historyRes.data || []);

    if (seasonRes.data?.id) {
      const lbRes = await getSeasonLeaderboardAction(seasonRes.data.id, boardType, 50);
      if (lbRes.success) setLeaderboard(lbRes.data || []);
    }

    if (seasonRes.data?.id) {
      setRewardClaimed(false);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData(activeBoard);
  }, []);

  useEffect(() => {
    if (!season?.ends_at) return;
    function update() {
      const diff = new Date(season.ends_at).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Skončené");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [season?.ends_at]);

  async function handleBoardChange(type: string) {
    setActiveBoard(type);
    if (!season?.id) return;
    setLeaderboard([]);
    const lbRes = await getSeasonLeaderboardAction(season.id, type, 50);
    if (lbRes.success) setLeaderboard(lbRes.data || []);
  }

  async function handleClaim() {
    if (!season?.id) return;
    setClaiming(true);
    try {
      const res = await claimSeasonRewardAction(season.id);
      if (res.success) setRewardClaimed(true);
    } finally {
      setClaiming(false);
    }
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
      <PageHeader title="Sezóny" subtitle="Súťaž v sezónnych turnajoch" />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        {season ? (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="h-4 w-4 text-[#f59e0b]" />
                    <p className="text-xs text-[#64748b]">Aktuálna sezóna</p>
                  </div>
                  <p className="text-lg font-bold text-[#e2e8f0]">{season.name}</p>
                  {season.description && (
                    <p className="text-xs text-[#64748b] mt-1">{season.description}</p>
                  )}
                </div>
                <Badge variant="uncommon">
                  <Clock className="h-3 w-3 mr-1" />
                  {timeLeft}
                </Badge>
              </div>
              {season.reward_pool && (
                <div className="mt-3 p-2 rounded bg-[#1a1a2e] border border-[#2a2a44]">
                  <p className="text-[10px] text-[#4a4a6c] uppercase tracking-wider mb-1">Odmeny za sezónu</p>
                  <p className="text-sm text-[#e2e8f0]">{season.reward_pool}</p>
                </div>
              )}
              <div className="mt-3">
                <Button
                  variant="primary"
                  size="sm"
                  loading={claiming}
                  disabled={rewardClaimed}
                  onClick={handleClaim}
                >
                  <Trophy className="h-3 w-3 mr-1" />
                  {rewardClaimed ? "Odmena prevzatá" : "Prevziať odmenu"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-xs text-[#64748b]">Žiadna aktívna sezóna. Nová sezóna čoskoro!</p>
            </CardContent>
          </Card>
        )}

        {season && (
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
              Rebríček sezóny
            </h3>
            <Tabs defaultValue="level" onValueChange={handleBoardChange}>
              <TabsList>
                {BOARD_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    <tab.icon className="h-3 w-3 mr-1" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {BOARD_TABS.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  {leaderboard.length === 0 ? (
                    <Card>
                      <CardContent className="py-6 text-center">
                        <p className="text-xs text-[#64748b]">Žiadne záznamy v rebríčku.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard.map((entry: any, i: number) => (
                        <Card key={entry.id ?? i}>
                          <CardContent className="py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-[#4a4a6c] w-6 text-right">
                                {i + 1}.
                              </span>
                              <div>
                                <p className="text-sm font-medium text-[#e2e8f0]">
                                  {entry.character_name ?? entry.name ?? "Neznámy"}
                                </p>
                              </div>
                            </div>
                            <Badge variant="default">
                              {tab.value === "gold" ? `${entry.value ?? 0} zlato` : entry.value ?? 0}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {history.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
              História sezón
            </h3>
            <div className="space-y-2">
              {history.map((s: any) => (
                <Card key={s.id}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#e2e8f0]">{s.name}</p>
                      <p className="text-[10px] text-[#64748b]">
                        {new Date(s.starts_at).toLocaleDateString("sk")} —{" "}
                        {s.ends_at ? new Date(s.ends_at).toLocaleDateString("sk") : "Prebieha"}
                      </p>
                    </div>
                    <Badge variant={s.status === "active" ? "uncommon" : "cursed"}>
                      {s.status === "active" ? "Aktívna" : "Skončená"}
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
