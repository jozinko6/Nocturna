"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Coins, Users, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminEconomyPage() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(false);
    }
    load();
  }, []);

  const metrics = [
    {
      label: "Celkom zlatých v obehu",
      value: stats.totalGold || 0,
      icon: Coins,
      color: "#fbbf24",
    },
    {
      label: "Priemer zlatých / hráča",
      value: stats.avgGoldPerPlayer || 0,
      icon: TrendingUp,
      color: "#10b981",
    },
    {
      label: "Kryštály v obehu",
      value: stats.totalCrystals || 0,
      icon: TrendingUp,
      color: "#a855f7",
    },
    {
      label: "Priemerná úroveň",
      value: stats.avgLevel || 0,
      icon: Activity,
      color: "#6366f1",
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Ekonomika"
        subtitle="Prehľad ekonomiky hry"
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((metric) => (
                <Card key={metric.label}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      <metric.icon
                        className="h-4 w-4"
                        style={{ color: metric.color }}
                      />
                      <span className="text-lg font-bold text-[#e2e8f0] tabular-nums">
                        {(metric.value || 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748b]">{metric.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="py-4">
                <h4 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
                  Transakcie (posledné)
                </h4>
                <div className="text-center py-8">
                  <Coins className="h-8 w-8 text-[#4a4a6c] mx-auto mb-2" />
                  <p className="text-xs text-[#64748b]">
                    Žiadne dáta o transakciách zatiaľ
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
