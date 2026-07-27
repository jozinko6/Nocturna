"use client";

import { useEffect, useState } from "react";
import { Star, Crown, Lock, Gift, ChevronRight, Gem } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getSeasonPassTiersAction,
  getSeasonPassProgressAction,
  claimTierRewardAction,
  unlockPremiumPassAction,
} from "@/app/actions/seasonpass.actions";

export default function SeasonPassPage() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    async function load() {
      const [tiersRes, progressRes] = await Promise.all([
        getSeasonPassTiersAction(),
        getSeasonPassProgressAction(),
      ]);
      if (tiersRes.success) setTiers(tiersRes.data?.tiers || []);
      if (progressRes.success) setProgress(progressRes.data);
      setLoading(false);
    }
    load();
  }, []);

  async function handleClaimReward(tierId: string, track: "free" | "premium") {
    setClaiming(`${tierId}-${track}`);
    try {
      const result = await claimTierRewardAction(parseInt(tierId), track === "premium");
      if (result.success) {
        const [tiersRes, progressRes] = await Promise.all([
          getSeasonPassTiersAction(),
          getSeasonPassProgressAction(),
        ]);
        if (tiersRes.success) setTiers(tiersRes.data?.tiers || []);
        if (progressRes.success) setProgress(progressRes.data);
      }
    } finally {
      setClaiming(null);
    }
  }

  async function handleUnlockPremium() {
    setUnlocking(true);
    try {
      const result = await unlockPremiumPassAction();
      if (result.success) {
        const progressRes = await getSeasonPassProgressAction();
        if (progressRes.success) setProgress(progressRes.data);
      }
    } finally {
      setUnlocking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentTier = progress?.currentTier || 0;
  const currentXP = progress?.currentXP || 0;
  const xpToNextTier = progress?.xpToNextTier || 100;
  const hasPremium = progress?.hasPremium || false;

  const tierProgress = xpToNextTier > 0 ? (currentXP / xpToNextTier) * 100 : 0;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Sezónny pas"
        subtitle="Postupuj sezónou a získavaj odmeny"
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#1e122e] border border-[#a855f7]/30">
                  <Star className="h-6 w-6 text-[#c084fc]" />
                </div>
                <div>
                  <p className="text-xs text-[#64748b]">Úroveň</p>
                  <p className="text-2xl font-bold text-[#e2e8f0] tabular-nums">
                    {currentTier}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={hasPremium ? "legendary" : "default"}>
                  {hasPremium ? (
                    <>
                      <Crown className="h-3 w-3 mr-0.5" />
                      Premium
                    </>
                  ) : (
                    "Free"
                  )}
                </Badge>
              </div>
            </div>
            <Progress variant="xp" value={tierProgress} label="XP do ďalšej úrovne" showLabel />
          </CardContent>
        </Card>

        {!hasPremium && (
          <Card className="border-[#fbbf24]/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#2a2218] border border-[#5c4a1e]">
                    <Crown className="h-5 w-5 text-[#fbbf24]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e2e8f0]">Odomkni Premium</p>
                    <p className="text-[10px] text-[#64748b]">
                      Získaj prístup k exkluzívnym odmenám
                    </p>
                  </div>
                </div>
                <Button
                  variant="premium"
                  size="sm"
                  loading={unlocking}
                  onClick={handleUnlockPremium}
                >
                  <Gem className="h-4 w-4" />
                  500
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
            Úrovne odmien
          </h3>
          <div className="space-y-2">
            {tiers.map((tier: any) => {
              const isUnlocked = tier.level <= currentTier;
              const freeClaimed = tier.freeClaimed;
              const premiumClaimed = tier.premiumClaimed;

              return (
                <Card key={tier.id} className={!isUnlocked ? "opacity-50" : ""}>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={isUnlocked ? "uncommon" : "default"}>
                        Úr. {tier.level}
                      </Badge>
                      <span className="text-xs text-[#64748b]">
                        {tier.xpRequired} XP
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between bg-[#0a0a0f] border border-[#2a2a44] rounded-sm px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-[#94a3b8]" />
                          <div>
                            <p className="text-[10px] text-[#64748b]">Free</p>
                            <p className="text-xs font-medium text-[#e2e8f0]">
                              {tier.freeReward?.name || "—"}
                            </p>
                          </div>
                        </div>
                        {isUnlocked && !freeClaimed ? (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={claiming === `${tier.id}-free`}
                            onClick={() => handleClaimReward(tier.id, "free")}
                          >
                            <Gift className="h-3 w-3" />
                          </Button>
                        ) : freeClaimed ? (
                          <Badge variant="uncommon">Získaná</Badge>
                        ) : (
                          <Lock className="h-4 w-4 text-[#4a4a6c]" />
                        )}
                      </div>
                      <div className={`flex items-center justify-between border rounded-sm px-3 py-2 ${
                        hasPremium ? "bg-[#2a2218] border-[#5c4a1e]" : "bg-[#0a0a0f] border-[#2a2a44]"
                      }`}>
                        <div className="flex items-center gap-2">
                          <Crown className={`h-4 w-4 ${hasPremium ? "text-[#fbbf24]" : "text-[#4a4a6c]"}`} />
                          <div>
                            <p className="text-[10px] text-[#64748b]">Premium</p>
                            <p className="text-xs font-medium text-[#e2e8f0]">
                              {tier.premiumReward?.name || "—"}
                            </p>
                          </div>
                        </div>
                        {hasPremium && isUnlocked && !premiumClaimed ? (
                          <Button
                            variant="premium"
                            size="sm"
                            loading={claiming === `${tier.id}-premium`}
                            onClick={() => handleClaimReward(tier.id, "premium")}
                          >
                            <Gift className="h-3 w-3" />
                          </Button>
                        ) : premiumClaimed ? (
                          <Badge variant="legendary">Získaná</Badge>
                        ) : (
                          <Lock className="h-4 w-4 text-[#4a4a6c]" />
                        )}
                      </div>
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
