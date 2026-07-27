"use client";

import { useEffect, useState } from "react";
import { Users, Copy, Check, Gift, Plus, Send, Trophy, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  generateReferralCodeAction,
  applyReferralAction,
  getReferralStatsAction,
  getReferralRewardsAction,
  claimReferralRewardAction,
} from "@/app/actions/referral.actions";

export default function ReferralsPage() {
  const [stats, setStats] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [claimingReward, setClaimingReward] = useState<string | null>(null);
  const [applyCode, setApplyCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [statsRes, rewardsRes] = await Promise.all([
        getReferralStatsAction(),
        getReferralRewardsAction(),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (rewardsRes.success) setRewards([...(rewardsRes.data?.asReferrer || []), ...(rewardsRes.data?.asReferred || [])]);
      setLoading(false);
    }
    load();
  }, []);

  async function handleGenerateCode() {
    setGenerating(true);
    try {
      const result = await generateReferralCodeAction();
      if (result.success) {
        const statsRes = await getReferralStatsAction();
        if (statsRes.success) setStats(statsRes.data);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleApplyCode() {
    if (!applyCode.trim()) return;
    setApplying(true);
    setApplyMessage(null);
    try {
      const result = await applyReferralAction(applyCode.trim());
      if (result.success) {
        setApplyMessage("Referenčný kód úspešne použitý!");
        setApplyCode("");
        const [statsRes, rewardsRes] = await Promise.all([
          getReferralStatsAction(),
          getReferralRewardsAction(),
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (rewardsRes.success) setRewards([...(rewardsRes.data?.asReferrer || []), ...(rewardsRes.data?.asReferred || [])]);
      } else {
        setApplyMessage(result.error || "Nepodarilo sa použiť kód.");
      }
    } finally {
      setApplying(false);
    }
  }

  async function handleClaimReward(rewardId: string) {
    setClaimingReward(rewardId);
    try {
      const result = await claimReferralRewardAction(rewardId);
      if (result.success) {
        const rewardsRes = await getReferralRewardsAction();
        if (rewardsRes.success) setRewards([...(rewardsRes.data?.asReferrer || []), ...(rewardsRes.data?.asReferred || [])]);
      }
    } finally {
      setClaimingReward(null);
    }
  }

  function copyCode() {
    if (!stats?.referralCode) return;
    navigator.clipboard.writeText(stats.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        title="Referraly"
        subtitle="Pozvi priateľov a získavaj odmeny"
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <Card>
          <CardContent className="py-4">
            {stats?.referralCode ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-[#64748b]">Tvoj referraľný kód</p>
                  <Badge variant="uncommon">Aktívny</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#0a0a0f] border border-[#3a3a5c] rounded-sm px-3 py-2">
                    <p className="text-lg font-bold text-[#e2e8f0] font-mono tracking-wider">
                      {stats.referralCode}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={copyCode}>
                    {copied ? (
                      <Check className="h-4 w-4 text-[#4ade80]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-[#64748b] mb-3">
                  Ešte nemáš referraľný kód
                </p>
                <Button
                  variant="primary"
                  loading={generating}
                  onClick={handleGenerateCode}
                >
                  <Plus className="h-4 w-4" />
                  Vygenerovať kód
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider">Použitia</p>
              <p className="text-lg font-bold text-[#e2e8f0] tabular-nums mt-1">
                {stats?.totalUses || 0}/{stats?.maxUses || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider">Odmeny</p>
              <p className="text-lg font-bold text-[#fbbf24] tabular-nums mt-1">
                {stats?.rewardsEarned || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider">Zostáva</p>
              <p className="text-lg font-bold text-[#4ade80] tabular-nums mt-1">
                {(stats?.maxUses || 0) - (stats?.totalUses || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-3">
              <Send className="h-4 w-4 text-[#64748b]" />
              <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c]">Použiť referraľný kód</h3>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Zadaj kód..."
                value={applyCode}
                onChange={(e) => setApplyCode(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="primary"
                loading={applying}
                onClick={handleApplyCode}
                disabled={!applyCode.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {applyMessage && (
              <p className="text-xs text-[#94a3b8] mt-2">{applyMessage}</p>
            )}
          </CardContent>
        </Card>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
            Odmeny za referraly
          </h3>
          {rewards.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-xs text-[#64748b]">
                  Zatiaľ žiadne odmeny. Pozvi priateľov!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {rewards.map((reward: any) => (
                <Card key={reward.id}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#2a2218] border border-[#5c4a1e]">
                        <Gift className="h-5 w-5 text-[#fbbf24]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#e2e8f0]">
                          {reward.name}
                        </p>
                        <p className="text-[10px] text-[#64748b]">
                          {reward.description}
                        </p>
                      </div>
                    </div>
                    {reward.claimed ? (
                      <Badge variant="uncommon">Získaná</Badge>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={claimingReward === reward.id}
                        onClick={() => handleClaimReward(reward.id)}
                      >
                        <Gift className="h-3 w-3" />
                      </Button>
                    )}
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
