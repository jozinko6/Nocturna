"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Coins,
  Swords,
  TrendingUp,
  Activity,
  AlertTriangle,
  Crown,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activePlayers: 0,
    totalGold: 0,
    totalExpeditions: 0,
    pvpBattles: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(false);
    }
    load();
  }, []);

  const statsCards = [
    {
      label: "Celkom hráčov",
      value: stats.totalPlayers,
      icon: Users,
      color: "#6366f1",
    },
    {
      label: "Aktívni (24h)",
      value: stats.activePlayers,
      icon: Activity,
      color: "#10b981",
    },
    {
      label: "Celkom zlatých",
      value: stats.totalGold,
      icon: Coins,
      color: "#fbbf24",
    },
    {
      label: "Výpravy",
      value: stats.totalExpeditions,
      icon: Swords,
      color: "#f97316",
    },
    {
      label: "PvP súbojov",
      value: stats.pvpBattles,
      icon: Swords,
      color: "#dc2626",
    },
    {
      label: "Príjmy",
      value: `${stats.revenue} EUR`,
      icon: TrendingUp,
      color: "#a855f7",
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Prehľad celého sveta Nocturna"
      />

      <div className="p-4 md:p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {statsCards.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon
                        className="h-4 w-4"
                        style={{ color: stat.color }}
                      />
                      <span className="text-lg font-bold text-[#e2e8f0] tabular-nums">
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748b]">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
                Rýchle akcie
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Card className="hover:border-[#3a3a5c] transition-colors cursor-pointer">
                  <CardContent className="py-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#6366f1]" />
                    <span className="text-xs text-[#e2e8f0]">
                      Správa hráčov
                    </span>
                  </CardContent>
                </Card>
                <Card className="hover:border-[#3a3a5c] transition-colors cursor-pointer">
                  <CardContent className="py-3 flex items-center gap-2">
                    <Coins className="h-4 w-4 text-[#fbbf24]" />
                    <span className="text-xs text-[#e2e8f0]">
                      Ekonomika
                    </span>
                  </CardContent>
                </Card>
                <Card className="hover:border-[#3a3a5c] transition-colors cursor-pointer">
                  <CardContent className="py-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[#f97316]" />
                    <span className="text-xs text-[#e2e8f0]">
                      Bezpečnosť
                    </span>
                  </CardContent>
                </Card>
                <Card className="hover:border-[#3a3a5c] transition-colors cursor-pointer">
                  <CardContent className="py-3 flex items-center gap-2">
                    <Crown className="h-4 w-4 text-[#a855f7]" />
                    <span className="text-xs text-[#e2e8f0]">
                      Platby
                    </span>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardContent className="py-4">
                <h4 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
                  Systém
                </h4>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Server status</span>
                    <span className="text-[#10b981]">Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Posledný reset</span>
                    <span className="text-[#94a3b8]">Dnes 04:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Verzia</span>
                    <span className="text-[#94a3b8]">0.1.0-alpha</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
