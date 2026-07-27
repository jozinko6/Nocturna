"use client";

import { useEffect, useState } from "react";
import {
  Castle,
  Swords,
  Lock,
  Hammer,
  Eye,
  Clock,
  Coins,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getHideout, startUpgrade, completeUpgrade } from "@/app/actions/hideout.actions";
import { buildings } from "@/lib/config/hideout";

const BUILDING_ICONS: Record<string, React.ComponentType<any>> = {
  b_main_hall: Castle,
  b_training: Swords,
  b_vault: Lock,
  b_forge: Hammer,
  b_watchtower: Eye,
};

const BUILDING_TYPE_TO_CONFIG: Record<string, string> = {
  main_hall: "b_main_hall",
  training_chamber: "b_training",
  vault: "b_vault",
  workshop: "b_forge",
  guard_tower: "b_watchtower",
};

const CONFIG_ID_TO_BUILDING_TYPE: Record<string, string> = {
  b_main_hall: "main_hall",
  b_training: "training_chamber",
  b_vault: "vault",
  b_forge: "workshop",
  b_watchtower: "guard_tower",
};

export default function HideoutPage() {
  const [hideoutBuildings, setHideoutBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const result = await getHideout();
      if (result.success) setHideoutBuildings(result.data?.buildings || []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newCountdowns: Record<string, string> = {};
      hideoutBuildings.forEach((b: any) => {
        if (b.upgradeEndsAt) {
          const end = new Date(b.upgradeEndsAt).getTime();
          if (end > now) {
            const diff = end - now;
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            newCountdowns[b.buildingType] = `${m}:${s.toString().padStart(2, "0")}`;
          } else {
            newCountdowns[b.buildingType] = "Hotovo!";
          }
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);
    return () => clearInterval(interval);
  }, [hideoutBuildings]);

  async function handleStartUpgrade(buildingType: string) {
    setUpgrading(buildingType);
    try {
      const result = await startUpgrade(buildingType);
      if (result.success) {
        const hideRes = await getHideout();
        if (hideRes.success) setHideoutBuildings(hideRes.data?.buildings || []);
      }
    } finally {
      setUpgrading(null);
    }
  }

  async function handleCompleteUpgrade(buildingType: string) {
    setUpgrading(buildingType);
    try {
      const result = await completeUpgrade(buildingType);
      if (result.success) {
        const hideRes = await getHideout();
        if (hideRes.success) setHideoutBuildings(hideRes.data?.buildings || []);
      }
    } finally {
      setUpgrading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const hasActiveUpgrade = hideoutBuildings.some(
    (b: any) => b.upgradeEndsAt && new Date(b.upgradeEndsAt).getTime() > Date.now()
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="Úkryt" subtitle="Vylepšuj svoju základňu" />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        {buildings.map((buildingConfig) => {
          const bt = CONFIG_ID_TO_BUILDING_TYPE[buildingConfig.id];
          const dbBuilding = hideoutBuildings.find(
            (b: any) => b.buildingType === bt
          );
          const currentLevel = dbBuilding?.level ?? 0;
          const isUpgrading =
            dbBuilding?.upgradeEndsAt &&
            new Date(dbBuilding.upgradeEndsAt).getTime() > Date.now();
          const isComplete =
            dbBuilding?.upgradeEndsAt &&
            new Date(dbBuilding.upgradeEndsAt).getTime() <= Date.now() &&
            currentLevel < buildingConfig.maxLevel;

          const nextLevelConfig =
            currentLevel < buildingConfig.maxLevel
              ? buildingConfig.levels[currentLevel]
              : null;

          const BuildingIcon = BUILDING_ICONS[buildingConfig.id] || Castle;

          return (
            <Card key={buildingConfig.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-[#1a1a2e] border border-[#2a2a44] flex items-center justify-center">
                    <BuildingIcon className="h-5 w-5 text-[#6366f1]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#e2e8f0]">
                        {buildingConfig.name}
                      </h3>
                      <span className="text-xs text-[#64748b]">
                        Úroveň {currentLevel}/{buildingConfig.maxLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748b] mt-0.5">
                      {buildingConfig.description}
                    </p>

                    {nextLevelConfig && (
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-[11px] text-[#94a3b8]">
                          <Coins className="h-3 w-3 inline mr-1 text-[#f59e0b]" />
                          {nextLevelConfig.goldCost} zlatých
                        </div>
                        <div className="text-[11px] text-[#94a3b8]">
                          {nextLevelConfig.bonusDescription}
                        </div>
                      </div>
                    )}

                    {isUpgrading && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3 text-[#0ea5e9]" />
                          <span className="text-[11px] text-[#0ea5e9] tabular-nums font-mono">
                            {countdowns[bt!] || "..."}
                          </span>
                        </div>
                        <Progress variant="energy" value={50} />
                      </div>
                    )}

                    {isComplete && (
                      <div className="mt-3">
                        <Button
                          variant="primary"
                          size="sm"
                          loading={upgrading === bt}
                          onClick={() => handleCompleteUpgrade(bt!)}
                        >
                          Dokončiť vylepšenie
                        </Button>
                      </div>
                    )}

                    {!isUpgrading && !isComplete && nextLevelConfig && (
                      <div className="mt-3">
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={hasActiveUpgrade}
                          loading={upgrading === bt}
                          onClick={() => handleStartUpgrade(bt!)}
                        >
                          {currentLevel === 0 ? "Postaviť" : "Vylepšiť"}
                        </Button>
                        {hasActiveUpgrade && (
                          <p className="text-[10px] text-[#64748b] mt-1">
                            Počkaj na dokončenie aktuálneho vylepšenia.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
