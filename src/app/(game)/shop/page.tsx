"use client";

import { useEffect, useState } from "react";
import { Clock, Coins, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItemCard } from "@/components/ui/item-card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getShopStock, buyItem, sellItemToShop } from "@/app/actions/shop.actions";
import { getCharacter } from "@/app/actions/character.actions";
import { getInventory } from "@/app/actions/inventory.actions";

export default function ShopPage() {
  const [stock, setStock] = useState<any[]>([]);
  const [gold, setGold] = useState(0);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [selling, setSelling] = useState<string | null>(null);
  const [refreshTime, setRefreshTime] = useState("");

  useEffect(() => {
    async function load() {
      const [stockRes, charRes, invRes] = await Promise.all([
        getShopStock(),
        getCharacter(),
        getInventory(),
      ]);
      if (stockRes.success) {
        setStock(stockRes.data?.stock || []);
        setRefreshTime(stockRes.data?.refreshTime || "");
      }
      if (charRes.success) setGold(charRes.data?.character?.gold ?? 0);
      if (invRes.success) setInventory(invRes.data?.inventory || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleBuy(shopItemId: string) {
    setBuying(shopItemId);
    try {
      const key = `buy-${shopItemId}-${Date.now()}`;
      const result = await buyItem(shopItemId, key);
      if (result.success) {
        const [stockRes, charRes] = await Promise.all([
          getShopStock(),
          getCharacter(),
        ]);
        if (stockRes.success) setStock(stockRes.data?.stock || []);
        if (charRes.success) setGold(charRes.data?.character?.gold ?? 0);
      }
    } finally {
      setBuying(null);
    }
  }

  async function handleSell(itemId: string) {
    setSelling(itemId);
    try {
      const key = `sell-shop-${itemId}-${Date.now()}`;
      const result = await sellItemToShop(itemId, key);
      if (result.success) {
        const [charRes, invRes] = await Promise.all([
          getCharacter(),
          getInventory(),
        ]);
        if (charRes.success) setGold(charRes.data?.character?.gold ?? 0);
        if (invRes.success) setInventory(invRes.data?.inventory || []);
      }
    } finally {
      setSelling(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const timeUntilRefresh = refreshTime
    ? Math.max(0, Math.floor((new Date(refreshTime).getTime() - Date.now()) / 60000))
    : 0;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Obchod"
        subtitle={`${gold} zlatých`}
        action={
          <div className="flex items-center gap-1 text-[10px] text-[#64748b]">
            <Clock className="h-3 w-3" />
            {timeUntilRefresh}m
          </div>
        }
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <Tabs defaultValue="buy">
          <TabsList>
            <TabsTrigger value="buy">Nakúpiť</TabsTrigger>
            <TabsTrigger value="sell">Predať</TabsTrigger>
          </TabsList>

          <TabsContent value="buy">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stock.map((item: any) => {
                const price = item.buyPrice;
                const canAfford = gold >= price;
                return (
                  <Card key={item.id}>
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <ItemCard
                            name={item.name}
                            type={item.slot}
                            rarity={item.rarity || "common"}
                            compact
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Coins className="h-3 w-3 text-[#f59e0b]" />
                          <span className="text-xs font-medium text-[#f59e0b] tabular-nums">
                            {price}
                          </span>
                        </div>
                        <Button
                          variant={canAfford ? "primary" : "secondary"}
                          size="sm"
                          disabled={!canAfford}
                          loading={buying === item.id}
                          onClick={() => handleBuy(item.id)}
                        >
                          Kúpiť
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="sell">
            {inventory.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <ShoppingCart className="h-8 w-8 text-[#4a4a6c] mx-auto mb-2" />
                  <p className="text-xs text-[#64748b]">Nemáš nič na predaj</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {inventory.map((item: any) => {
                  const template = item.item_templates;
                  if (!template) return null;
                  const sellPrice = template.sellPrice || Math.floor((template.buyPrice || 0) * 0.5);
                  return (
                    <Card key={item.id}>
                      <CardContent className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-[#e2e8f0]">
                            {template.name}
                          </p>
                          <Badge variant={template.rarity || "common"} className="mt-1">
                            {template.rarity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#f59e0b] tabular-nums">
                            +{sellPrice}g
                          </span>
                          <Button
                            variant="danger"
                            size="sm"
                            loading={selling === item.id}
                            onClick={() => handleSell(item.id)}
                          >
                            Predať
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
