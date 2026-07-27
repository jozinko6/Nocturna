"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ItemCard } from "@/components/ui/item-card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getInventory, getEquipment } from "@/app/actions/inventory.actions";

const EQUIPMENT_SLOTS = [
  { key: "weapon", label: "Zbraň" },
  { key: "offhand", label: "Druhá ruka" },
  { key: "helmet", label: "Prilba" },
  { key: "armor", label: "Brnenie" },
  { key: "gloves", label: "Rukavice" },
  { key: "boots", label: "Topánky" },
  { key: "amulet", label: "Amulet" },
  { key: "ring", label: "Prsteň" },
  { key: "relic", label: "Relikvia" },
];

export default function InventoryPage() {
  const [equipment, setEquipment] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      const [eqRes, invRes] = await Promise.all([
        getEquipment(),
        getInventory(),
      ]);
      if (eqRes.success) setEquipment(eqRes.data?.equipment);
      if (invRes.success) setInventory(invRes.data?.inventory || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const filteredInventory = inventory.filter((item) => {
    if (filter === "all") return true;
    return item.item_templates?.slot === filter;
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Inventár" subtitle="Výstroj a predmety" />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
            Výstroj
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
            {EQUIPMENT_SLOTS.map((slot) => {
              const equipped = equipment?.[slot.key];
              return (
                <Card key={slot.key}>
                  <CardContent className="py-3 text-center">
                    <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1">
                      {slot.label}
                    </p>
                    {equipped && typeof equipped === "object" && "name" in equipped ? (
                      <div>
                        <Badge variant={equipped.rarity || "default"} className="mb-1">
                          {equipped.name}
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-[10px] text-[#4a4a6c]">Prázdne</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c]">
              Inventár
            </h3>
            <span className="text-[10px] text-[#4a4a6c]">
              {inventory.length} predmetov
            </span>
          </div>

          <Tabs defaultValue="all" onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">Všetko</TabsTrigger>
              <TabsTrigger value="weapon">Zbrane</TabsTrigger>
              <TabsTrigger value="armor">Brnenie</TabsTrigger>
              <TabsTrigger value="helmet">Prilby</TabsTrigger>
              <TabsTrigger value="boots">Topánky</TabsTrigger>
              <TabsTrigger value="accessory">Doplnky</TabsTrigger>
            </TabsList>
            <TabsContent value="all">{null}</TabsContent>
            <TabsContent value="weapon">{null}</TabsContent>
            <TabsContent value="armor">{null}</TabsContent>
            <TabsContent value="helmet">{null}</TabsContent>
            <TabsContent value="boots">{null}</TabsContent>
            <TabsContent value="accessory">{null}</TabsContent>
          </Tabs>

          {filteredInventory.length === 0 ? (
            <Card className="mt-4">
              <CardContent className="py-8 text-center">
                <Package className="h-8 w-8 text-[#4a4a6c] mx-auto mb-2" />
                <p className="text-xs text-[#64748b]">Inventár je prázdny</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
              {filteredInventory.map((item) => {
                const template = item.item_templates;
                if (!template) return null;
                return (
                  <Link key={item.id} href={`/inventory/${item.id}`}>
                    <ItemCard
                      name={template.name}
                      type={template.slot}
                      rarity={template.rarity || "common"}
                      compact
                      className="cursor-pointer"
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
