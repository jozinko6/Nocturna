"use client";

import { useEffect, useState, use } from "react";
import { Shield, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { equipItem, unequipItem, sellItem, getEquipment, getInventory } from "@/app/actions/inventory.actions";

const SLOT_MAP: Record<string, string> = {
  weapon: "weapon",
  offhand: "offhand",
  helmet: "helmet",
  armor: "armor",
  gloves: "gloves",
  boots: "boots",
  amulet: "amulet",
  ring: "ring",
  relic: "relic",
};

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [inventoryItem, setInventoryItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const invRes = await getInventory();
      if (invRes.success) {
        const items = invRes.data?.inventory || [];
        setInventoryItem(items.find((i: any) => i.id === id) || null);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleEquip() {
    if (!inventoryItem) return;
    const template = inventoryItem.item_templates;
    const slot = SLOT_MAP[template?.slot] || template?.slot || "weapon";
    setActionLoading("equip");
    try {
      await equipItem(id, slot as any);
      window.history.back();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnequip() {
    if (!inventoryItem) return;
    const template = inventoryItem.item_templates;
    const slot = SLOT_MAP[template?.slot] || template?.slot || "weapon";
    setActionLoading("unequip");
    try {
      await unequipItem(slot as any);
      window.history.back();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSell() {
    setActionLoading("sell");
    try {
      const key = `sell-${id}-${Date.now()}`;
      await sellItem(id, key);
      window.history.back();
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!inventoryItem) {
    return (
      <div className="p-4 text-center text-sm text-[#64748b] py-20">
        Predmet nenájdený.
      </div>
    );
  }

  const template = inventoryItem.item_templates;
  const rarityVariant = (template?.rarity || "common") as any;
  const sellPrice = template?.sellPrice || Math.floor((template?.buyPrice || 0) * 0.5);

  const statsList = [
    template?.stats?.weaponDamage && { label: "Poškodenie", value: template.stats.weaponDamage },
    template?.stats?.armor && { label: "Obrana", value: template.stats.armor },
    template?.stats?.maxHp && { label: "Max HP", value: template.stats.maxHp },
    template?.stats?.strength && { label: "Sila", value: template.stats.strength },
    template?.stats?.dexterity && { label: "Obratnosť", value: template.stats.dexterity },
    template?.stats?.endurance && { label: "Vytrvalosť", value: template.stats.endurance },
    template?.stats?.perception && { label: "Vnímanie", value: template.stats.perception },
    template?.stats?.luck && { label: "Šťastie", value: template.stats.luck },
  ].filter(Boolean) as { label: string; value: number }[];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={template?.name || "Predmet"}
        subtitle={template?.slot || ""}
        onBack={() => window.history.back()}
      />

      <div className="p-4 md:p-6 max-w-lg mx-auto space-y-4">
        <Card glow={rarityVariant !== "common" ? rarityVariant : undefined}>
          <CardContent className="py-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-[#e2e8f0]">
                  {template?.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={rarityVariant}>{template?.rarity}</Badge>
                  <span className="text-xs text-[#64748b]">{template?.slot}</span>
                </div>
              </div>
            </div>

            {statsList.length > 0 && (
              <div className="space-y-1.5 mb-4">
                {statsList.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-[#94a3b8]">{stat.label}</span>
                    <span className="text-[#e2e8f0] font-medium tabular-nums">
                      +{stat.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {template?.description && (
              <p className="text-xs text-[#64748b] leading-relaxed italic border-t border-[#2a2a44] pt-3 mt-3">
                {template.description}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            loading={actionLoading === "equip"}
            onClick={handleEquip}
          >
            Vybaviť
          </Button>
          <Button
            variant="danger"
            size="md"
            loading={actionLoading === "sell"}
            onClick={handleSell}
          >
            <Coins className="h-4 w-4" /> Predať ({sellPrice}g)
          </Button>
        </div>
      </div>
    </div>
  );
}
