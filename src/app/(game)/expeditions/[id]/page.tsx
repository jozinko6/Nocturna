"use client";

import { useEffect, useState, use } from "react";
import { Clock, Trophy, Coins, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getExpeditionResult, completeExpedition, claimExpeditionReward } from "@/app/actions/expedition.actions";

export default function ExpeditionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [expedition, setExpedition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    async function load() {
      const result = await getExpeditionResult(id);
      if (result.success) {
        setExpedition(result.data?.expedition);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!expedition || expedition.status !== "in_progress") return;
    function updateCountdown() {
      const endTime = new Date(expedition.ends_at).getTime();
      const now = Date.now();
      const diff = endTime - now;
      if (diff <= 0) {
        setCountdown("Hotovo!");
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expedition]);

  async function handleComplete() {
    setCompleting(true);
    try {
      const result = await completeExpedition(id);
      if (result.success) {
        const expRes = await getExpeditionResult(id);
        if (expRes.success) setExpedition(expRes.data?.expedition);
      }
    } finally {
      setCompleting(false);
    }
  }

  async function handleClaim() {
    setClaiming(true);
    try {
      const key = `claim-exp-${id}-${Date.now()}`;
      const result = await claimExpeditionReward(id, key);
      if (result.success) {
        const expRes = await getExpeditionResult(id);
        if (expRes.success) setExpedition(expRes.data?.expedition);
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

  if (!expedition) {
    return (
      <div className="p-4 text-center text-sm text-[#64748b] py-20">
        Výprava nenájdená.
      </div>
    );
  }

  const config = expedition.config as { regionId?: string; difficulty?: string } | null;
  const reward = expedition.activity_rewards?.[0];
  const report = expedition.battle_reports?.[0];
  const result = report?.result as { winner?: string; totalAttackerDamage?: number; totalDefenderDamage?: number } | undefined;
  const isVictory = result?.winner === "attacker";
  const rounds = result ? (report as any).rounds : null;

  const elapsed = Date.now() - new Date(expedition.started_at).getTime();
  const total = new Date(expedition.ends_at).getTime() - new Date(expedition.started_at).getTime();
  const progressPct = expedition.status === "completed" ? 100 : Math.min(100, (elapsed / total) * 100);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Výprava"
        subtitle={`${config?.difficulty || ""} · ${expedition.status === "in_progress" ? "Prebieha" : expedition.status === "completed" ? "Dokončená" : "Vyzdvihnutá"}`}
        onBack={() => window.history.back()}
      />

      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        {expedition.status === "in_progress" && (
          <Card variant="highlighted">
            <CardContent className="py-6 text-center">
              <Clock className="h-8 w-8 text-[#0ea5e9] mx-auto mb-3" />
              <p className="text-xs text-[#64748b] mb-1">Prebieha</p>
              <p className="text-2xl font-bold text-[#e2e8f0] tabular-nums font-mono">
                {countdown}
              </p>
              <Progress
                variant="energy"
                className="mt-4 max-w-xs mx-auto"
                value={progressPct}
              />
            </CardContent>
          </Card>
        )}

        {expedition.status === "completed" && (
          <>
            <Card variant={isVictory ? "success" : "danger"}>
              <CardContent className="py-6 text-center">
                {isVictory ? (
                  <Trophy className="h-8 w-8 text-[#22c55e] mx-auto mb-3" />
                ) : (
                  <span className="text-3xl block mb-3">💀</span>
                )}
                <p className="text-base font-semibold text-[#e2e8f0]">
                  {isVictory ? "Víťazstvo!" : "Porážka"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4 space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c]">
                  Odmeny
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-[#f59e0b]" />
                    <span className="text-sm text-[#e2e8f0]">
                      {reward?.gold_amount ?? 0} zlatých
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-[#6366f1]" />
                    <span className="text-sm text-[#e2e8f0]">
                      {reward?.experience_amount ?? 0} XP
                    </span>
                  </div>
                </div>
                {reward?.item_id && (
                  <div className="flex items-center gap-2 p-2 rounded-sm bg-[#1a1a2e] border border-[#a855f7]/20">
                    <span className="text-xs text-[#c084fc]">
                      Získal si predmet!
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {rounds && (
              <Card>
                <CardContent className="py-4">
                  <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
                    Priebeh boja
                  </h3>
                  <div className="space-y-2">
                    {rounds.map((round: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-[11px] py-1.5 border-b border-[#2a2a44]/30 last:border-0"
                      >
                        <span className="text-[#64748b] w-12">Kolo {round.round}</span>
                        <span className="text-[#dc2626] tabular-nums">
                          -{round.defenderDamage ?? 0}
                        </span>
                        <span className="text-[#22c55e] tabular-nums">
                          -{round.attackerDamage ?? 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {!reward?.claimed && (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                loading={claiming}
                onClick={handleClaim}
              >
                Vybrať odmeny
              </Button>
            )}

            {reward?.claimed && (
              <p className="text-center text-xs text-[#4a4a6c]">
                Odmeny už boli vybrané.
              </p>
            )}
          </>
        )}

        {expedition.status === "in_progress" && (
          <Card>
            <CardContent className="py-6 text-center">
              <Button
                variant="primary"
                size="lg"
                loading={completing}
                onClick={handleComplete}
              >
                Dokončiť výpravu
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
