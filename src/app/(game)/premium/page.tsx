"use client";

import { useEffect, useState } from "react";
import { Star, Crown, Gem, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getCrystalPackages, createCheckout, getMembershipStatus } from "@/app/actions/premium.actions";
import { getCharacter } from "@/app/actions/character.actions";

export default function PremiumPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [membership, setMembership] = useState<any>(null);
  const [crystals, setCrystals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [pkgRes, memRes, charRes] = await Promise.all([
        getCrystalPackages(),
        getMembershipStatus(),
        getCharacter(),
      ]);
      if (pkgRes.success) setPackages(pkgRes.data?.packages || []);
      if (memRes.success) setMembership(memRes.data);
      if (charRes.success)
        setCrystals(charRes.data?.character?.premium_currency ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  async function handlePurchase(packageId: string) {
    setPurchasing(packageId);
    try {
      const result = await createCheckout(packageId);
      if (result.success && result.data?.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      }
    } finally {
      setPurchasing(null);
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
      <PageHeader title="Premium" subtitle="Kryštály a členstvo" />

      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        <Card variant="highlighted">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gem className="h-5 w-5 text-[#a855f7]" />
              <span className="text-sm font-medium text-[#e2e8f0]">
                Tvoje kryštály
              </span>
            </div>
            <span className="text-lg font-bold text-[#a855f7] tabular-nums">
              {crystals}
            </span>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
            Balíčky kryštálov
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                variant={pkg.recommended ? "highlighted" : "default"}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-[#e2e8f0]">
                        {pkg.name}
                      </h4>
                      <p className="text-[11px] text-[#64748b] mt-0.5">
                        {pkg.description}
                      </p>
                    </div>
                    {pkg.recommended && (
                      <Badge variant="legendary">Populárne</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#e2e8f0]">
                      {pkg.priceEur} EUR
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={purchasing === pkg.id}
                      onClick={() => handlePurchase(pkg.id)}
                    >
                      Kúpiť
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
            Členstvo
          </h3>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Crown className="h-6 w-6 text-[#fbbf24] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-[#fbbf24]">
                      {membership?.isMember ? membership.membership?.planName : "Nočný rytier"}
                    </h4>
                    {membership?.isMember && (
                      <Badge variant="legendary">Aktívne</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748b] mb-3">
                    Mesačné členstvo s exkluzívnymi výhodami
                  </p>
                  <div className="space-y-1 mb-3">
                    {[
                      "100 kryštálov mesačne",
                      "+15% bonus na XP",
                      "+10% bonus na zlaté",
                      "Rýchlejšia regenerácia energie",
                      "1 extra denná úloha",
                    ].map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2 text-[11px] text-[#94a3b8]">
                        <Sparkles className="h-3 w-3 text-[#fbbf24]" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                  {membership?.isMember ? (
                    <p className="text-xs text-[#4a4a6c]">
                      Členstvo platí ešte {membership.membership?.daysRemaining} dní
                    </p>
                  ) : (
                    <Button variant="primary" size="md" className="w-full">
                      4.99 EUR / mesiac
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
