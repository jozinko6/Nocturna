"use client";

import { useEffect, useState } from "react";
import { Flame, Trophy, Calendar, Gift, ChevronRight, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getStreakInfoAction,
  claimStreakBonusAction,
  recordLoginAction,
  getStreakLeaderboardAction,
} from "@/app/actions/retention.actions";

const MILESTONES = [7, 14, 30, 60, 90, 180, 365];

export default function RetentionPage() {
  const [streakInfo, setStreakInfo] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [recording, setRecording] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const [streakRes, lbRes] = await Promise.all([
        getStreakInfoAction(),
        getStreakLeaderboardAction(),
      ]);
      if (streakRes.success) setStreakInfo(streakRes.data);
      if (lbRes.success) setLeaderboard(lbRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleRecordLogin() {
    setRecording(true);
    try {
      const result = await recordLoginAction();
      if (result.success) {
        const streakRes = await getStreakInfoAction();
        if (streakRes.success) setStreakInfo(streakRes.data);
      }
    } finally {
      setRecording(false);
    }
  }

  async function handleClaimBonus() {
    setClaiming(true);
    try {
      const result = await claimStreakBonusAction();
      if (result.success) {
        const streakRes = await getStreakInfoAction();
        if (streakRes.success) setStreakInfo(streakRes.data);
      }
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

  const currentStreak = streakInfo?.currentStreak || 0;
  const longestStreak = streakInfo?.longestStreak || 0;
  const totalLogins = streakInfo?.totalLogins || 0;
  const calendar = streakInfo?.calendar || [];
  const bonusClaimed = streakInfo?.bonusClaimedToday || false;

  const nextMilestone = MILESTONES.find((m) => m > currentStreak) || MILESTONES[MILESTONES.length - 1];
  const prevMilestone = MILESTONES.filter((m) => m <= currentStreak).pop() || 0;
  const milestoneProgress = nextMilestone
    ? ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100
    : 100;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Denná odmena"
        subtitle="Prihlasuj sa každý deň a získavaj bonusy"
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#2a1810] border border-[#5c3a1e]">
                  <Flame className="h-6 w-6 text-[#f97316]" />
                </div>
                <div>
                  <p className="text-xs text-[#64748b]">Aktuálna séria</p>
                  <p className="text-2xl font-bold text-[#e2e8f0] tabular-nums">
                    {currentStreak} <span className="text-sm font-normal text-[#64748b]">dní</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#64748b]">Najdlhšia séria</p>
                <p className="text-sm font-semibold text-[#fbbf24] tabular-nums">
                  {longestStreak} dní
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#4a4a6c] mb-1">
              <span>{prevMilestone} dní</span>
              <span>{nextMilestone} dní</span>
            </div>
            <Progress variant="xp" value={milestoneProgress} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider">Celkové prihlásenia</p>
              <p className="text-lg font-bold text-[#e2e8f0] tabular-nums mt-1">{totalLogins}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider">Ďalší míľnik</p>
              <p className="text-lg font-bold text-[#fbbf24] tabular-nums mt-1">{nextMilestone} dní</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-[#64748b]" />
              <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c]">Kalendár (30 dní)</h3>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {calendar.map((day: any, i: number) => (
                <div
                  key={i}
                  className={`aspect-square rounded-sm flex items-center justify-center text-[10px] tabular-nums border ${
                    day.logged
                      ? "bg-[#122a18] border-[#22c55e]/30 text-[#4ade80]"
                      : "bg-[#0a0a0f] border-[#2a2a44] text-[#4a4a6c]"
                  }`}
                >
                  {day.day}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            loading={recording}
            onClick={handleRecordLogin}
            disabled={streakInfo?.todayRecorded}
          >
            <Flame className="h-4 w-4" />
            {streakInfo?.todayRecorded ? "Dnes už zaznamenané" : "Zaznamenať prihlásenie"}
          </Button>
          <Button
            variant="premium"
            className="flex-1"
            loading={claiming}
            onClick={handleClaimBonus}
            disabled={bonusClaimed}
          >
            <Gift className="h-4 w-4" />
            {bonusClaimed ? "Bonus už získaný" : "Získať denný bonus"}
          </Button>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
            Rebríček série
          </h3>
          {leaderboard.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-xs text-[#64748b]">
                  Žiadne záznamy v rebríčku.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry: any, i: number) => (
                <Card key={entry.id || i}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#4a4a6c] w-5 text-center tabular-nums">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-[#e2e8f0]">
                          {entry.name}
                        </p>
                        <p className="text-[10px] text-[#64748b]">
                          Najdlhšia séria: {entry.longestStreak} dní
                        </p>
                      </div>
                    </div>
                    <Badge variant={i < 3 ? "legendary" : "default"}>
                      <Flame className="h-3 w-3 mr-0.5" />
                      {entry.currentStreak}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
