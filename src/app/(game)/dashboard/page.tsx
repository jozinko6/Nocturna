"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Swords,
  Dumbbell,
  ShoppingBag,
  SwordsIcon,
  Trophy,
  Clock,
  ScrollText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getCharacter } from "@/app/actions/character.actions";
import { getExpeditions } from "@/app/actions/expedition.actions";
import { getDailyQuests } from "@/app/actions/daily.actions";
import { getNotifications } from "@/app/actions/notifications.actions";
import { experienceForLevel } from "@/game/formulas";

export default function DashboardPage() {
  const [character, setCharacter] = useState<any>(null);
  const [expeditions, setExpeditions] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [charRes, expRes, questRes, notifRes] = await Promise.all([
        getCharacter(),
        getExpeditions(),
        getDailyQuests(),
        getNotifications(),
      ]);

      if (charRes.success) setCharacter(charRes.data?.character);
      if (expRes.success) setExpeditions(expRes.data?.expeditions || []);
      if (questRes.success) setQuests(questRes.data?.quests || []);
      if (notifRes.success) setNotifications(notifRes.data?.notifications || []);
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
  const resources = character?.character_resources;
  const faction = character?.factions;
  const activeExpedition = expeditions.find((e) => e.status === "in_progress");

  const completedQuests = quests.filter(
    (q: any) => q.completed && !q.claimed
  );

  const level = character?.level ?? 1;
  const xpForCurrent = experienceForLevel(level);
  const xpForNext = experienceForLevel(level + 1);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-lg font-semibold text-[#e2e8f0]">
            {character?.name}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="default">
              {faction?.name}
            </Badge>
            <span className="text-xs text-[#64748b]">
              Úroveň {level}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#94a3b8]">Skúsenosti</span>
              <span className="text-xs text-[#94a3b8] tabular-nums">
                {character?.experience ?? 0} / {xpForNext}
              </span>
            </div>
            <Progress
              variant="xp"
              value={(character?.experience ?? 0) - xpForCurrent}
              max={xpForNext - xpForCurrent}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1">Energia</p>
              <p className="text-lg font-bold text-[#0ea5e9] tabular-nums">
                {resources?.current_energy ?? 0}
              </p>
              <p className="text-[10px] text-[#4a4a6c]">/ {resources?.max_energy ?? 100}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1">Zlaté</p>
              <p className="text-lg font-bold text-[#f59e0b] tabular-nums">
                {character?.gold ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1">Kryštály</p>
              <p className="text-lg font-bold text-[#a855f7] tabular-nums">
                {character?.premium_currency ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {activeExpedition && (
        <Card variant="highlighted">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-[#0ea5e9]" />
              <span className="text-xs font-medium text-[#e2e8f0]">
                Aktívna výprava
              </span>
            </div>
            <p className="text-xs text-[#64748b]">
              {activeExpedition.config?.difficulty || "Prebieha..."}
            </p>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
          Rýchle akcie
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/expeditions", icon: Swords, label: "Expedície", color: "text-[#dc2626]" },
            { href: "/character/training", icon: Dumbbell, label: "Tréning", color: "text-[#6366f1]" },
            { href: "/shop", icon: ShoppingBag, label: "Obchod", color: "text-[#f59e0b]" },
            { href: "/pvp", icon: SwordsIcon, label: "PvP Aréna", color: "text-[#22c55e]" },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="hover:bg-[#1a1a2e] hover:border-[#3a3a5c] transition-colors cursor-pointer">
                <CardContent className="py-4 flex flex-col items-center gap-2">
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <span className="text-xs font-medium text-[#e2e8f0]">
                    {action.label}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {completedQuests.length > 0 && (
        <Card variant="success">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-[#22c55e]" />
              <span className="text-xs font-medium text-[#e2e8f0]">
                Hotové úlohy ({completedQuests.length})
              </span>
            </div>
            <Link href="/daily">
              <Button variant="ghost" size="sm" className="mt-1 -ml-2">
                Vybrať odmeny
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {notifications.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase tracking-widest text-[#4a4a6c]">
              Notifikácie
            </h2>
            <Link href="/notifications" className="text-xs text-[#6366f1] hover:text-[#818cf8]">
              Zobraziť všetky
            </Link>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((n: any) => (
              <Card key={n.id}>
                <CardContent className="py-3 flex items-start gap-3">
                  <ScrollText className="h-4 w-4 text-[#64748b] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-[#e2e8f0] truncate">{n.title}</p>
                    <p className="text-[10px] text-[#64748b] mt-0.5 truncate">
                      {n.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
