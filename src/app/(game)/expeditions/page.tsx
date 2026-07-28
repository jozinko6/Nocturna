"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, Zap, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { regions } from "@/lib/config/regions";
import { getCharacter } from "@/app/actions/character.actions";
import { getExpeditions, startExpedition } from "@/app/actions/expedition.actions";

const DIFFICULTIES = [
  { key: "safe" as const, label: "Bezpečná", energyCost: 10, color: "text-[#22c55e]" },
  { key: "uncertain" as const, label: "Neistá", energyCost: 15, color: "text-[#f59e0b]" },
  { key: "dangerous" as const, label: "Nebezpečná", energyCost: 20, color: "text-[#dc2626]" },
  { key: "lethal" as const, label: "Smrteľná", energyCost: 30, color: "text-[#a855f7]" },
];

export default function ExpeditionsPage() {
  const [character, setCharacter] = useState<any>(null);
  const [expeditions, setExpeditions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [charRes, expRes] = await Promise.all([
        getCharacter(),
        getExpeditions(),
      ]);
      if (charRes.success) setCharacter(charRes.data?.character);
      if (expRes.success) setExpeditions(expRes.data?.expeditions || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleStartExpedition(regionId: string, difficulty: "safe" | "uncertain" | "dangerous" | "lethal") {
    setStarting(`${regionId}:${difficulty}`);
    setActionError(null);
    try {
      const result = await startExpedition(regionId, difficulty);
      if (result.success && result.data?.activity?.id) {
        window.location.assign(`/expeditions/${result.data.activity.id}`);
        return;
      }
      setActionError(result.error || "Výpravu sa nepodarilo spustiť.");
    } catch {
      setActionError("Výpravu sa nepodarilo spustiť. Skús to znova.");
    } finally {
      setStarting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const level = character?.level ?? 1;
  const energy = character?.character_resources?.current_energy ?? 0;
  const activeExpedition = expeditions.find((e) => e.status === "in_progress");

  return (
    <div className="animate-fade-in">
      <PageHeader title="Expedície" subtitle="Preskúmaj temné regióny" />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        {actionError && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded border border-[#7f1d1d] bg-[#450a0a]/40 px-3 py-2 text-xs text-[#fca5a5]"
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {activeExpedition && (
          <Card variant="highlighted">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#0ea5e9]" />
                  <div>
                    <p className="text-xs font-medium text-[#e2e8f0]">
                      Aktívna výprava
                    </p>
                    <p className="text-[10px] text-[#64748b]">
                      {activeExpedition.config?.difficulty || "Prebieha..."}
                    </p>
                  </div>
                </div>
                <Link href={`/expeditions/${activeExpedition.id}`}>
                  <Button variant="ghost" size="sm">
                    Zobraziť <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regions.map((region) => {
            const isRecommended =
              level >= region.recommendedLevel[0] && level <= region.recommendedLevel[1];
            const isTooWeak = level < region.recommendedLevel[0] - 2;

            return (
              <Card
                key={region.id}
                variant={isRecommended ? "highlighted" : "default"}
                className="relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{ backgroundColor: region.accentColor }}
                />
                <CardContent className="relative py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-[#e2e8f0]">
                        {region.name}
                      </h3>
                      <p className="text-[11px] text-[#64748b] mt-0.5">
                        Odporúčaná úroveň: {region.recommendedLevel[0]}–{region.recommendedLevel[1]}
                      </p>
                    </div>
                    {isTooWeak && (
                      <Badge variant="cursed">Slabý</Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#94a3b8] leading-relaxed mb-4 line-clamp-2">
                    {region.description}
                  </p>

                  {!activeExpedition && (
                    <div className="space-y-2">
                      {DIFFICULTIES.map((diff) => {
                        const canAfford = energy >= diff.energyCost;
                        const isStarting = starting === `${region.id}:${diff.key}`;
                        return (
                          <div key={diff.key} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-medium ${diff.color}`}>
                                {diff.label}
                              </span>
                              <span className="text-[10px] text-[#4a4a6c]">
                                {diff.energyCost} energie
                              </span>
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={!canAfford || isStarting || !!activeExpedition}
                              loading={isStarting}
                              onClick={() => handleStartExpedition(region.id, diff.key)}
                              aria-label={`Spustiť výpravu: ${region.name}, ${diff.label}`}
                              className="text-[11px] h-7 px-2"
                            >
                              <Zap className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
