"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swords, Shield, Eye, Zap, Heart, Clover, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { getCharacter, getCharacterStats } from "@/app/actions/character.actions";
import { experienceForLevel, attackPower, defensePower } from "@/game/formulas";

const ATTRIBUTES = [
  { key: "strength", name: "Sila", icon: Swords, color: "text-[#dc2626]" },
  { key: "dexterity", name: "Obratnosť", icon: Zap, color: "text-[#22c55e]" },
  { key: "endurance", name: "Vytrvalosť", icon: Shield, color: "text-[#3b82f6]" },
  { key: "perception", name: "Vnímanie", icon: Eye, color: "text-[#a855f7]" },
  { key: "willpower", name: "Vôľa", icon: Heart, color: "text-[#f59e0b]" },
  { key: "luck", name: "Šťastie", icon: Clover, color: "text-[#6366f1]" },
];

export default function CharacterPage() {
  const [character, setCharacter] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [charRes, statsRes] = await Promise.all([
        getCharacter(),
        getCharacterStats(),
      ]);
      if (charRes.success) setCharacter(charRes.data?.character);
      if (statsRes.success) setStatsData(statsRes.data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full border-2 border-[#2a2a44] border-t-[#6366f1] animate-spin" />
      </div>
    );
  }

  const stats = character?.character_stats;
  const faction = character?.factions;
  const level = character?.level ?? 1;
  const xpForCurrent = experienceForLevel(level);
  const xpForNext = experienceForLevel(level + 1);
  const pvpRating = character?.pvp_rating ?? 1000;

  const atkPower = stats ? attackPower(stats) : 0;
  const defPower = stats ? defensePower(stats) : 0;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Postava" subtitle="Detailné informácie o tvojej postave" />

      <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-[#e2e8f0]">
                  {character?.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default">
                    {faction?.name}
                  </Badge>
                  <span className="text-xs text-[#64748b]">
                    Úroveň {level}
                  </span>
                </div>
              </div>
            </div>
            <Progress
              variant="xp"
              label="Skúsenosti"
              value={(character?.experience ?? 0) - xpForCurrent}
              max={xpForNext - xpForCurrent}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1">Útok</p>
              <p className="text-lg font-bold text-[#dc2626] tabular-nums">
                {atkPower}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1">Obrana</p>
              <p className="text-lg font-bold text-[#3b82f6] tabular-nums">
                {defPower}
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
            Atribúty
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ATTRIBUTES.map((attr) => {
              const value = stats?.[attr.key] ?? 0;
              return (
                <Card key={attr.key}>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <attr.icon className={`h-4 w-4 ${attr.color}`} />
                      <span className="text-xs font-medium text-[#e2e8f0]">
                        {attr.name}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-[#e2e8f0] tabular-nums">
                      {value}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-1">
                  Celková sila
                </h3>
                <p className="text-2xl font-bold text-[#e2e8f0] tabular-nums">
                  {statsData?.powerLevel ?? atkPower}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#64748b]">
                  PvP hodnotenie
                </p>
                <p className="text-lg font-semibold text-[#f59e0b] tabular-nums">
                  {pvpRating}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-2">
          <Link href="/character/training">
            <button className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-sm font-medium text-sm bg-[#1a1a2e] text-[#e2e8f0] border border-[#3a3a5c] hover:bg-[#22223a] transition-colors">
              <Swords className="h-4 w-4" />
              Trénovať atribúty
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
