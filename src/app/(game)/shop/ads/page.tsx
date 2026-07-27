"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Play,
  Coins,
  Zap,
  Gem,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  canClaimAdAction,
  claimAdRewardAction,
  getAdClaimHistoryAction,
  getAdRewardsAction,
} from "@/app/actions/ad.actions";

const REWARD_ICONS: Record<string, React.ReactNode> = {
  gold: <Coins className="h-5 w-5 text-[#fbbf24]" />,
  energy: <Zap className="h-5 w-5 text-[#0ea5e9]" />,
  crystals: <Gem className="h-5 w-5 text-[#6366f1]" />,
};

const REWARD_COLORS: Record<string, string> = {
  gold: "text-[#fbbf24]",
  energy: "text-[#0ea5e9]",
  crystals: "text-[#6366f1]",
};

export default function AdsPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [claimStatus, setClaimStatus] = useState<{
    canClaim: boolean;
    reason?: string;
    nextAvailableAt?: string | Date;
  }>({ canClaim: false });
  const [claimHistory, setClaimHistory] = useState<{
    count: number;
    claims: any[];
  }>({ count: 0, claims: [] });
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const loadData = useCallback(async () => {
    const [rewardsRes, canClaimRes, historyRes] = await Promise.all([
      getAdRewardsAction(),
      canClaimAdAction(),
      getAdClaimHistoryAction(),
    ]);
    if (rewardsRes.success) setRewards(rewardsRes.data || []);
    if (canClaimRes.success) setClaimStatus(canClaimRes.data || { canClaim: false });
    if (historyRes.success)
      setClaimHistory(historyRes.data || { count: 0, claims: [] });
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!claimStatus.nextAvailableAt) {
      setCooldown(0);
      return;
    }

    function tick() {
      const remaining = Math.max(
        0,
        Math.ceil(
          (new Date(claimStatus.nextAvailableAt!).getTime() - Date.now()) /
            1000
        )
      );
      setCooldown(remaining);
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [claimStatus.nextAvailableAt]);

  async function handleClaim(rewardType: string) {
    setClaiming(rewardType);
    try {
      const res = await claimAdRewardAction(rewardType);
      if (res.success) await loadData();
    } finally {
      setClaiming(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const claimsUsed = claimHistory.count;
  const claimsRemaining = Math.max(0, 5 - claimsUsed);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Odmeny za reklamy"
        subtitle="Pozeraj reklamy a získavaj odmeny"
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <Card>
          <CardContent className="py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#64748b]">Denné odmeny</p>
                <p className="text-lg font-bold text-[#e2e8f0] tabular-nums">
                  {claimsUsed} / 5
                </p>
              </div>
              {cooldown > 0 && (
                <Badge variant="default">
                  <Clock className="h-2.5 w-2.5 mr-1" />
                  {cooldown}s
                </Badge>
              )}
            </div>
            <Progress
              variant="xp"
              value={claimsUsed}
              max={5}
              label="Denný limit"
              showLabel
            />
            {!claimStatus.canClaim && claimStatus.reason && (
              <p className="text-[10px] text-[#64748b]">
                {claimStatus.reason}
              </p>
            )}
          </CardContent>
        </Card>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
            Dostupné odmeny
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {rewards.map((reward: any) => (
              <Card key={reward.type}>
                <CardContent className="py-4 space-y-3 text-center">
                  <div className="flex justify-center">
                    {REWARD_ICONS[reward.type] || (
                      <Coins className="h-5 w-5 text-[#64748b]" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#e2e8f0]">
                      {reward.label}
                    </p>
                    <p
                      className={`text-lg font-bold tabular-nums ${REWARD_COLORS[reward.type] || "text-[#e2e8f0]"}`}
                    >
                      +{reward.amount}
                    </p>
                  </div>
                  <Button
                    variant={claimStatus.canClaim ? "primary" : "secondary"}
                    size="sm"
                    className="w-full"
                    loading={claiming === reward.type}
                    disabled={!claimStatus.canClaim || cooldown > 0}
                    onClick={() => handleClaim(reward.type)}
                  >
                    {claimStatus.canClaim ? (
                      <>
                        <Play className="h-3 w-3" />
                        Prevziať
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" />
                        Nedostupné
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {claimHistory.claims.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
              História dnešných odmien
            </h3>
            <div className="space-y-2">
              {claimHistory.claims.map((claim: any) => (
                <Card key={claim.id}>
                  <CardContent className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#4ade80]" />
                      <span className="text-xs text-[#cbd5e1]">
                        {claim.rewardType === "gold"
                          ? "Zlato"
                          : claim.rewardType === "energy"
                            ? "Energia"
                            : "Kryštály"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-medium tabular-nums ${REWARD_COLORS[claim.rewardType] || "text-[#e2e8f0]"}`}
                      >
                        +{claim.rewardAmount}
                      </span>
                      <span className="text-[10px] text-[#4a4a6c]">
                        {new Date(claim.createdAt).toLocaleTimeString("sk", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
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
