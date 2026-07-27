"use client";

import { useEffect, useState } from "react";
import { Trophy, Calendar, Coins, Star, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getDailyQuests,
  claimQuestReward,
  getDailyReward,
  claimDailyReward,
} from "@/app/actions/daily.actions";

export default function DailyPage() {
  const [quests, setQuests] = useState<any[]>([]);
  const [dailyReward, setDailyReward] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claimingQuest, setClaimingQuest] = useState<string | null>(null);
  const [claimingDaily, setClaimingDaily] = useState(false);

  useEffect(() => {
    async function load() {
      const [questRes, dailyRes] = await Promise.all([
        getDailyQuests(),
        getDailyReward(),
      ]);
      if (questRes.success) setQuests(questRes.data?.quests || []);
      if (dailyRes.success) setDailyReward(dailyRes.data);
      setLoading(false);
    }
    load();
  }, []);

  async function handleClaimQuest(missionId: string) {
    setClaimingQuest(missionId);
    try {
      const key = `quest-${missionId}-${Date.now()}`;
      await claimQuestReward(missionId, key);
      const questRes = await getDailyQuests();
      if (questRes.success) setQuests(questRes.data?.quests || []);
    } finally {
      setClaimingQuest(null);
    }
  }

  async function handleClaimDaily() {
    setClaimingDaily(true);
    try {
      const key = `daily-${Date.now()}`;
      await claimDailyReward(key);
      const dailyRes = await getDailyReward();
      if (dailyRes.success) setDailyReward(dailyRes.data);
    } finally {
      setClaimingDaily(false);
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
      <PageHeader title="Denné odmeny" subtitle="Plň úlohy a zbieraj odmeny" />

      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        {dailyReward && (
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
              Denná odmena
            </h3>
            <Card variant="highlighted">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#f59e0b]" />
                    <span className="text-sm font-medium text-[#e2e8f0]">
                      Deň {dailyReward.streakDay}/7
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
                    <span className="flex items-center gap-1">
                      <Coins className="h-3 w-3 text-[#f59e0b]" />
                      {dailyReward.currentReward?.gold}
                    </span>
                    {dailyReward.currentReward?.crystals > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-[#a855f7]" />
                        {dailyReward.currentReward?.crystals}
                      </span>
                    )}
                  </div>
                </div>
                <Progress
                  variant="xp"
                  value={dailyReward.streakDay}
                  max={7}
                />
                <div className="mt-3">
                  {dailyReward.canClaim ? (
                    <Button
                      variant="primary"
                      size="md"
                      loading={claimingDaily}
                      onClick={handleClaimDaily}
                      className="w-full"
                    >
                      Vybrať dennú odmenu
                    </Button>
                  ) : (
                    <p className="text-xs text-[#4a4a6c] text-center">
                      Už si dnes vybral/a odmenu.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
            Denné úlohy
          </h3>
          <div className="space-y-2">
            {quests.map((quest: any) => {
              const pct = Math.min(
                (quest.currentCount / quest.targetCount) * 100,
                100
              );
              const canClaim = quest.completed && !quest.claimed;

              return (
                <Card key={quest.missionId}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs font-medium text-[#e2e8f0]">
                          {quest.name}
                        </p>
                        <p className="text-[10px] text-[#64748b]">
                          {quest.description}
                        </p>
                      </div>
                      {quest.claimed && (
                        <CheckCircle className="h-4 w-4 text-[#22c55e]" />
                      )}
                    </div>
                    <Progress
                      variant={quest.completed ? "xp" : "default"}
                      value={quest.currentCount}
                      max={quest.targetCount}
                      showLabel
                      label={`${quest.currentCount}/${quest.targetCount}`}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-[10px] text-[#64748b]">
                        <span className="flex items-center gap-1">
                          <Coins className="h-3 w-3 text-[#f59e0b]" />
                          {quest.rewardGold}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-[#6366f1]" />
                          {quest.rewardXp} XP
                        </span>
                      </div>
                      {canClaim && (
                        <Button
                          variant="primary"
                          size="sm"
                          loading={claimingQuest === quest.missionId}
                          onClick={() => handleClaimQuest(quest.missionId)}
                        >
                          Vybrať
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
