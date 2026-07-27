"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { GameLayout } from "@/components/layout/game-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getCharacter } from "@/app/actions/character.actions";
import { getSession } from "@/app/actions/auth.actions";
import type { CharacterHeaderProps } from "@/components/ui/character-header";

const NAV_MAP: Record<string, string> = {
  "/dashboard": "dashboard",
  "/character": "character",
  "/character/training": "character",
  "/expeditions": "expeditions",
  "/inventory": "inventory",
  "/shop": "shop",
  "/pvp": "pvp",
  "/hideout": "hideout",
  "/daily": "daily",
  "/leaderboards": "leaderboards",
  "/notifications": "notifications",
  "/settings": "settings",
  "/premium": "premium",
};

export default function GameLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [character, setCharacter] = useState<CharacterHeaderProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const session = await getSession();
      if (!session.success || !session.data?.session) {
        router.replace("/login");
        return;
      }

      const charResult = await getCharacter();
      if (!charResult.success || !charResult.data?.character) {
        router.replace("/onboarding");
        return;
      }

      const c = charResult.data.character;
      const resources = c.character_resources;
      const faction = c.factions;

      setCharacter({
        name: c.name,
        level: c.level,
        hp: resources?.hit_points ?? 100,
        maxHp: resources?.max_hit_points ?? 100,
        energy: resources?.current_energy ?? 0,
        maxEnergy: resources?.max_energy ?? 100,
        gold: c.gold ?? 0,
        premium: c.premium_currency ?? 0,
        faction: faction?.name ?? "",
      });
      setLoading(false);
    }
    load();
  }, [router, pathname]);

  function getActiveNav(): string {
    for (const [path, nav] of Object.entries(NAV_MAP)) {
      if (pathname === path || pathname.startsWith(path + "/")) {
        return nav;
      }
    }
    return "dashboard";
  }

  function handleNavigate(id: string) {
    const routeMap: Record<string, string> = {
      dashboard: "/dashboard",
      character: "/character",
      expeditions: "/expeditions",
      inventory: "/inventory",
      shop: "/shop",
      pvp: "/pvp",
      hideout: "/hideout",
      daily: "/daily",
      leaderboards: "/leaderboards",
      notifications: "/notifications",
      settings: "/settings",
      premium: "/premium",
    };
    router.push(routeMap[id] || "/dashboard");
  }

  if (loading || !character) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <GameLayout
      character={character}
      activeNav={getActiveNav()}
      onNavigate={handleNavigate}
      locale="sk"
    >
      {children}
    </GameLayout>
  );
}
