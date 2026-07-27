"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Sparkles,
  Shield,
  Frame,
  Image,
  Type,
  Cat,
  Gem,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getShopCosmeticsAction,
  purchaseCosmeticAction,
  equipCosmeticAction,
  unequipCosmeticAction,
  getCharacterCosmeticsAction,
} from "@/app/actions/cosmetic.actions";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  aura: <Sparkles className="h-3.5 w-3.5" />,
  mount: <Shield className="h-3.5 w-3.5" />,
  frame: <Frame className="h-3.5 w-3.5" />,
  background: <Image className="h-3.5 w-3.5" />,
  title: <Type className="h-3.5 w-3.5" />,
  pet: <Cat className="h-3.5 w-3.5" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  aura: "Aury",
  mount: "Monti",
  frame: "Rámce",
  background: "Pozadia",
  title: "Tituly",
  pet: "Maznáčikovia",
};

const RARITY_BADGE: Record<string, "common" | "rare" | "epic" | "legendary"> = {
  common: "common",
  rare: "rare",
  epic: "epic",
  legendary: "legendary",
};

const RARITY_LABELS: Record<string, string> = {
  common: "Bežný",
  rare: "Vzácny",
  epic: "Epický",
  legendary: "Legendárny",
};

export default function CosmeticsShopPage() {
  const [cosmetics, setCosmetics] = useState<any[]>([]);
  const [ownedCosmetics, setOwnedCosmetics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [equipping, setEquipping] = useState<string | null>(null);

  const loadOwned = useCallback(async () => {
    const ownedRes = await getCharacterCosmeticsAction();
    if (ownedRes.success) setOwnedCosmetics(ownedRes.data || []);
  }, []);

  useEffect(() => {
    async function load() {
      const [cosRes] = await Promise.all([
        getShopCosmeticsAction(),
        loadOwned(),
      ]);
      if (cosRes.success) setCosmetics(cosRes.data || []);
      setLoading(false);
    }
    load();
  }, [loadOwned]);

  function isOwned(itemId: string) {
    return ownedCosmetics.some((c) => c.cosmeticItemId === itemId);
  }

  function isEquipped(itemId: string) {
    return ownedCosmetics.some(
      (c) => c.cosmeticItemId === itemId && c.equipped
    );
  }

  async function handleBuy(itemId: string) {
    setBuying(itemId);
    try {
      const res = await purchaseCosmeticAction(itemId);
      if (res.success) await loadOwned();
    } finally {
      setBuying(null);
    }
  }

  async function handleEquip(itemId: string) {
    setEquipping(itemId);
    try {
      if (isEquipped(itemId)) {
        await unequipCosmeticAction(itemId);
      } else {
        await equipCosmeticAction(itemId);
      }
      await loadOwned();
    } finally {
      setEquipping(null);
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
        title="Kozmetický obchod"
        subtitle="Vylepši vzhľad svojej postavy"
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <Tabs defaultValue="aura">
          <TabsList>
            {Object.keys(CATEGORY_LABELS).map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                <span className="flex items-center gap-1.5">
                  {CATEGORY_ICONS[cat]}
                  <span className="hidden sm:inline">{CATEGORY_LABELS[cat]}</span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(CATEGORY_LABELS).map((cat) => (
            <TabsContent key={cat} value={cat}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cosmetics
                  .filter((item) => item.category === cat)
                  .map((item) => {
                    const owned = isOwned(item.id);
                    const equipped = isEquipped(item.id);

                    return (
                      <Card
                        key={item.id}
                        variant={equipped ? "highlighted" : "default"}
                        glow={RARITY_BADGE[item.rarity]}
                      >
                        <CardContent className="py-4 space-y-3">
                          <div className="text-center">
                            {CATEGORY_ICONS[cat] && (
                              <div className="text-[#6366f1] mb-1 flex justify-center">
                                {CATEGORY_ICONS[cat]}
                              </div>
                            )}
                            <h3 className="text-sm font-semibold text-[#e2e8f0]">
                              {item.name}
                            </h3>
                            <p className="text-[10px] text-[#64748b] mt-0.5">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-center gap-2">
                            <Badge variant={RARITY_BADGE[item.rarity] || "common"}>
                              {RARITY_LABELS[item.rarity] || item.rarity}
                            </Badge>
                            {item.membershipOnly && (
                              <Badge variant="legendary">Členstvo</Badge>
                            )}
                          </div>

                          <div className="text-center">
                            {owned ? (
                              <Badge variant="uncommon">
                                <Check className="h-2.5 w-2.5 mr-1" />
                                Vlastníš
                              </Badge>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                <Gem className="h-3 w-3 text-[#6366f1]" />
                                <span className="text-sm font-bold text-[#e2e8f0] tabular-nums">
                                  {item.priceCrystals ?? 0}
                                </span>
                              </div>
                            )}
                          </div>

                          {owned ? (
                            <Button
                              variant={equipped ? "secondary" : "primary"}
                              size="sm"
                              className="w-full"
                              loading={equipping === item.id}
                              onClick={() => handleEquip(item.id)}
                            >
                              {equipped ? "Vybavené" : "Vybaviť"}
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full"
                              loading={buying === item.id}
                              onClick={() => handleBuy(item.id)}
                            >
                              Kúpiť
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                {cosmetics.filter((item) => item.category === cat).length === 0 && (
                  <div className="col-span-full">
                    <Card>
                      <CardContent className="py-6 text-center">
                        <p className="text-xs text-[#64748b]">
                          Žiadne predmety v tejto kategórii.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
