"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Crown, Coins, Swords } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getCharacter } from "@/app/actions/character.actions";

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState("level");
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const charRes = await getCharacter();
      if (charRes.success) setCharacter(charRes.data?.character);
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

  const tabs = [
    { id: "level", label: "Úroveň", icon: Trophy },
    { id: "pvp", label: "PvP", icon: Swords },
    { id: "gold", label: "Zlaté", icon: Coins },
    { id: "power", label: "Sila", icon: Crown },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Rebríčky" subtitle="Najlepší hráči sveta" />

      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <Card variant="highlighted">
          <CardContent className="py-3">
            <p className="text-xs text-[#64748b] mb-1">Tvoja pozícia</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#e2e8f0]">
                  {character?.name}
                </p>
                <p className="text-[10px] text-[#64748b]">
                  Úroveň {character?.level} · Rating {character?.pvp_rating ?? 1000}
                </p>
              </div>
              <Medal className="h-5 w-5 text-[#f59e0b]" />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="level" onValueChange={setActiveTab}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                <tab.icon className="h-3.5 w-3.5 mr-1" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <Card>
                <CardContent className="py-4">
                  <div className="text-center py-8">
                    <Trophy className="h-8 w-8 text-[#4a4a6c] mx-auto mb-2" />
                    <p className="text-xs text-[#64748b]">
                      Rebríčky budú dostupné čoskoro.
                    </p>
                    <p className="text-[10px] text-[#4a4a6c] mt-1">
                      Zatiaľ sa sústreď na svoj rozvoj.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
