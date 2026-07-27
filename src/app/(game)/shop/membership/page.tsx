"use client";

import { useEffect, useState } from "react";
import {
  Crown,
  Shield,
  Zap,
  Swords,
  Target,
  Sparkles,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getMembershipTiersAction,
  subscribeToMembershipAction,
  getSubscriptionStatusAction,
} from "@/app/actions/payment.actions";
import type { MembershipTier } from "@/lib/config/monetization";

export default function MembershipPage() {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [tiersRes, statusRes] = await Promise.all([
        getMembershipTiersAction(),
        getSubscriptionStatusAction(),
      ]);
      if (tiersRes.success) setTiers(tiersRes.data?.tiers || []);
      if (statusRes.success) setSubscriptionActive(statusRes.data?.active || false);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubscribe(tier: MembershipTier) {
    setSubscribing(tier.id);
    try {
      await subscribeToMembershipAction(tier.id);
      const statusRes = await getSubscriptionStatusAction();
      if (statusRes.success) setSubscriptionActive(statusRes.data?.active || false);
    } finally {
      setSubscribing(null);
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
      <PageHeader
        title="Členstvo"
        subtitle="Prémiové výhody pre temných bojovníkov"
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        {subscriptionActive && (
          <Card variant="success">
            <CardContent className="py-3 flex items-center gap-2">
              <Check className="h-4 w-4 text-[#4ade80]" />
              <span className="text-xs text-[#4ade80] font-medium">
                Máš aktívne predplatné
              </span>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tiers.map((tier) => (
            <Card key={tier.id}>
              <CardContent className="py-5 space-y-4">
                <div className="text-center">
                  <Crown
                    className={`h-10 w-10 mx-auto mb-2 ${
                      tier.id === "membership_premium"
                        ? "text-[#fbbf24]"
                        : "text-[#a5b4fc]"
                    }`}
                  />
                  <h3 className="text-base font-bold text-[#e2e8f0]">
                    {tier.name}
                  </h3>
                  <p className="text-[10px] text-[#64748b] mt-1">
                    {tier.description}
                  </p>
                </div>

                <div className="text-center">
                  <span className="text-2xl font-bold text-[#e2e8f0] tabular-nums">
                    {tier.priceEur.toFixed(2)} €
                  </span>
                  <span className="text-xs text-[#64748b]"> / mesiac</span>
                </div>

                <div className="text-center">
                  <Badge variant="lunari">
                    <Sparkles className="h-2.5 w-2.5 mr-1" />
                    {tier.monthlyCrystals} kryštálov mesačne
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-[#6366f1] flex-shrink-0" />
                    <span className="text-xs text-[#cbd5e1]">
                      XP {Math.round((tier.bonuses.xpMultiplier - 1) * 100) > 0 ? `+${Math.round((tier.bonuses.xpMultiplier - 1) * 100)}%` : "žiadne"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-[#fbbf24] flex-shrink-0" />
                    <span className="text-xs text-[#cbd5e1]">
                      Zlato {Math.round((tier.bonuses.goldMultiplier - 1) * 100) > 0 ? `+${Math.round((tier.bonuses.goldMultiplier - 1) * 100)}%` : "žiadne"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-[#0ea5e9] flex-shrink-0" />
                    <span className="text-xs text-[#cbd5e1]">
                      Regenerácia energie {tier.bonuses.energyRegenReduction > 0 ? `-${Math.round(tier.bonuses.energyRegenReduction * 100)}%` : "žiadna"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Swords className="h-3.5 w-3.5 text-[#f87171] flex-shrink-0" />
                    <span className="text-xs text-[#cbd5e1]">
                      {tier.bonuses.extraDailyMissions > 0 ? `+${tier.bonuses.extraDailyMissions} denné misie` : "Bežné misie"}
                    </span>
                  </div>
                  {tier.bonuses.pvpPriority && (
                    <div className="flex items-center gap-2">
                      <Crown className="h-3.5 w-3.5 text-[#fbbf24] flex-shrink-0" />
                      <span className="text-xs text-[#fbbf24]">
                        PvP priorita
                      </span>
                    </div>
                  )}
                  {tier.bonuses.exclusiveCosmetics.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-[#c084fc] flex-shrink-0" />
                      <span className="text-xs text-[#c084fc]">
                        Exkluzívna kozmetika
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  variant={
                    tier.id === "membership_premium" ? "premium" : "primary"
                  }
                  size="md"
                  className="w-full"
                  loading={subscribing === tier.id}
                  onClick={() => handleSubscribe(tier)}
                >
                  {subscriptionActive ? "Zmeniť plán" : "Prihlásiť sa"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
