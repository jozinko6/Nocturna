"use client";

import { useEffect, useState } from "react";
import { Search, UserPlus, Ban, Shield, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { searchPlayers } from "@/app/actions/admin.actions";

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const result = await searchPlayers("");
      if (result.success) setPlayers(result.data?.players || []);
      setLoading(false);
    }
    load();
  }, []);

  const filteredPlayers = players.filter(
    (p) =>
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.profiles?.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Správa hráčov"
        subtitle={`${players.length} celkom`}
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4a4a6c]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hľadať podľa emailu alebo mena..."
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredPlayers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-xs text-[#64748b]">
                {search ? "Žiadni hráči nenájdení" : "Žiadni hráči"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredPlayers.map((player) => (
              <Card key={player.id} className="hover:border-[#3a3a5c] transition-colors cursor-pointer">
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#1a1a2e] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#6366f1]">
                        {player.profiles?.display_name?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#e2e8f0] truncate">
                        {player.profiles?.display_name || "Bez mena"}
                      </p>
                      <p className="text-[10px] text-[#64748b] truncate">
                        {player.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {player.is_banned && (
                      <Badge variant="danger">Ban</Badge>
                    )}
                    <span className="text-[10px] text-[#4a4a6c]">
                      Lvl {player.characters?.level || 1}
                    </span>
                    <MoreHorizontal className="h-4 w-4 text-[#4a4a6c]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
