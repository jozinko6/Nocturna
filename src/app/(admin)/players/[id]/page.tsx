"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  Coins,
  Swords,
  Shield,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getPlayerDetails,
  banPlayer,
  adjustCurrency,
} from "@/app/actions/admin.actions";

export default function AdminPlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const result = await getPlayerDetails(id);
      if (result.success) setPlayer(result.data);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleBan() {
    setActionLoading("ban");
    try {
      await banPlayer(id, "Admin banned player");
      setPlayer((prev: any) => ({ ...prev, is_banned: true }));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnban() {
    setActionLoading("unban");
    try {
      await banPlayer(id, "Admin unbanned player");
      setPlayer((prev: any) => ({ ...prev, is_banned: false }));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleGoldAdjust(amount: number) {
    setActionLoading("gold");
    try {
      await adjustCurrency(id, "gold", amount, amount > 0 ? "Admin credit" : "Admin deduction");
      setPlayer((prev: any) => ({
        ...prev,
        characters: {
          ...prev.characters,
          character_resources: {
            ...prev.characters?.character_resources,
            gold:
              (prev.characters?.character_resources?.gold || 0) + amount,
          },
        },
      }));
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

  if (!player) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-[#64748b]">Hráč nenájdený</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/players")}
          className="mt-2"
        >
          Späť
        </Button>
      </div>
    );
  }

  const character = player.characters;
  const resources = character?.character_resources;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={player.profiles?.display_name || player.email}
        subtitle={`ID: ${player.id.slice(0, 8)}...`}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/players")}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Späť
          </Button>
        }
      />

      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <Card>
          <CardContent className="py-4 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c]">
              Základné info
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[#64748b]">Email</p>
                <p className="text-[#e2e8f0]">{player.email}</p>
              </div>
              <div>
                <p className="text-[#64748b]">Vytvorený</p>
                <p className="text-[#e2e8f0]">
                  {new Date(player.created_at).toLocaleDateString("sk")}
                </p>
              </div>
              <div>
                <p className="text-[#64748b]">Status</p>
                {player.is_banned ? (
                  <Badge variant="danger">Banovaný</Badge>
                ) : (
                  <Badge variant="common">Aktívny</Badge>
                )}
              </div>
              <div>
                <p className="text-[#64748b]">Premium</p>
                <p className="text-[#e2e8f0]">
                  {player.is_premium ? "Áno" : "Nie"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {character && (
          <Card>
            <CardContent className="py-4 space-y-3">
              <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c]">
                Postava
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-[#64748b]">Úroveň</p>
                  <p className="text-[#e2e8f0] font-bold">{character.level}</p>
                </div>
                <div>
                  <p className="text-[#64748b]">Power</p>
                  <p className="text-[#e2e8f0] font-bold">
                    {character.power_level?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[#64748b]">PvP Rating</p>
                  <p className="text-[#e2e8f0] font-bold">{character.rating}</p>
                </div>
                <div>
                  <p className="text-[#64748b]">Zlaté</p>
                  <p className="text-[#fbbf24] font-bold">
                    {resources?.gold?.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="py-4 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c]">
              Akcie
            </h3>
            <div className="flex flex-wrap gap-2">
              {player.is_banned ? (
                <Button
                  variant="secondary"
                  size="sm"
                  loading={actionLoading === "unban"}
                  onClick={handleUnban}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Odbanovať
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  loading={actionLoading === "ban"}
                  onClick={handleBan}
                >
                  <Ban className="h-3.5 w-3.5 mr-1" />
                  Banovať
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                loading={actionLoading === "gold"}
                onClick={() => handleGoldAdjust(1000)}
              >
                <Coins className="h-3.5 w-3.5 mr-1" />
                +1000 zlatých
              </Button>
              <Button
                variant="secondary"
                size="sm"
                loading={actionLoading === "gold"}
                onClick={() => handleGoldAdjust(-1000)}
              >
                <Coins className="h-3.5 w-3.5 mr-1" />
                -1000 zlatých
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
