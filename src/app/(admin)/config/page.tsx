"use client";

import { useEffect, useState } from "react";
import { Settings, Save, RotateCcw, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getFeatureFlags, toggleFeatureFlag } from "@/app/actions/admin.actions";

export default function AdminConfigPage() {
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getFeatureFlags();
      if (result.success) setConfig(result.data || {});
      setLoading(false);
    }
    load();
  }, []);

  function updateField(field: string, value: string) {
    setConfig((prev: any) => ({
      ...prev,
      [field]: field.includes("gold") || field.includes("cost") || field.includes("exp")
        ? parseInt(value) || 0
        : value,
    }));
    setSuccess(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const result = await toggleFeatureFlag("game_config", true);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } finally {
      setSaving(false);
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
        title="Konfigurácia hry"
        subtitle="Uprav herné parametre"
        action={
          <Button
            variant="secondary"
            size="sm"
            loading={saving}
            onClick={handleSave}
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            {success ? "Uložené!" : "Uložiť"}
          </Button>
        }
      />

      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <Card>
          <CardContent className="py-4 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c]">
              Energia
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#64748b] block mb-1">
                  Max. energia
                </label>
                <Input
                  type="number"
                  value={config.maxEnergy || 100}
                  onChange={(e) => updateField("maxEnergy", e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] text-[#64748b] block mb-1">
                  Regenerácia / min
                </label>
                <Input
                  type="number"
                  value={config.energyRegenRate || 1}
                  onChange={(e) => updateField("energyRegenRate", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c]">
              Tréning
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#64748b] block mb-1">
                  Základná cena tréningu
                </label>
                <Input
                  type="number"
                  value={config.baseTrainingCost || 100}
                  onChange={(e) => updateField("baseTrainingCost", e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] text-[#64748b] block mb-1">
                  Násobiteľ ceny
                </label>
                <Input
                  type="number"
                  value={config.trainingCostMultiplier || 1.5}
                  onChange={(e) => updateField("trainingCostMultiplier", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c]">
              Denný reset
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#64748b] block mb-1">
                  Hodina resetu (UTC)
                </label>
                <Input
                  type="number"
                  value={config.dailyResetHour || 4}
                  onChange={(e) => updateField("dailyResetHour", e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] text-[#64748b] block mb-1">
                  Bezplatné obnovenie shopu
                </label>
                <Input
                  type="number"
                  value={config.freeShopRefreshes || 3}
                  onChange={(e) => updateField("freeShopRefreshes", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="highlighted">
          <CardContent className="py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-[#fbbf24] mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-[#94a3b8]">
                Zmeny konfigurácie sa prejavia ihneď pre všetkých hráčov. Uistite sa, že rozumiete dôsledkom pred uložením.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
