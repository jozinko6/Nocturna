"use client";

import { useEffect, useState } from "react";
import { Gem, Sparkles, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getCrystalPackagesAction } from "@/app/actions/payment.actions";
import type { CrystalPackage } from "@/lib/config/monetization";

export default function CrystalsShopPage() {
  const [packages, setPackages] = useState<CrystalPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await getCrystalPackagesAction();
      if (res.success) setPackages(res.data?.packages || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleBuy(pkg: CrystalPackage) {
    setBuying(pkg.id);
    try {
      // TODO: integrate Stripe checkout
    } finally {
      setBuying(null);
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
        title="Obchod s kryštálmi"
        subtitle="Kúp kryštály pre prémiový obsah"
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              variant={pkg.recommended ? "highlighted" : "default"}
              className={pkg.recommended ? "relative" : ""}
            >
              {pkg.recommended && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                  <Badge variant="legendary">
                    <Star className="h-2.5 w-2.5 mr-1" />
                    Odporúčané
                  </Badge>
                </div>
              )}
              <CardContent className="py-4 space-y-3">
                <div className="text-center">
                  <Gem
                    className={`h-8 w-8 mx-auto mb-2 ${
                      pkg.recommended ? "text-[#fbbf24]" : "text-[#6366f1]"
                    }`}
                  />
                  <h3 className="text-sm font-semibold text-[#e2e8f0]">
                    {pkg.name}
                  </h3>
                  <p className="text-[10px] text-[#64748b] mt-1">
                    {pkg.description}
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#6366f1]" />
                    <span className="text-lg font-bold text-[#e2e8f0] tabular-nums">
                      {pkg.crystals}
                    </span>
                  </div>
                  {pkg.bonusCrystals > 0 && (
                    <p className="text-[10px] text-[#4ade80]">
                      +{pkg.bonusCrystals} bonus
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-base font-bold text-[#e2e8f0] tabular-nums">
                    {pkg.priceEur.toFixed(2)} €
                  </p>
                </div>

                <Button
                  variant={pkg.recommended ? "premium" : "primary"}
                  size="sm"
                  className="w-full"
                  loading={buying === pkg.id}
                  onClick={() => handleBuy(pkg)}
                >
                  Kúpiť
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
