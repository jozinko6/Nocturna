"use client";

import { useEffect, useState } from "react";
import { Shield, Users, Coins, Trophy, Search, LogOut, UserMinus, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  createClanAction,
  joinClanAction,
  leaveClanAction,
  kickMemberAction,
  depositToTreasuryAction,
  withdrawFromTreasuryAction,
  searchClansAction,
  getClanInfoAction,
  getClanMembersAction,
} from "@/app/actions/clan.actions";

const RANK_LABELS: Record<string, string> = {
  leader: "Vodca",
  officer: "Dôstojník",
  member: "Člen",
};

export default function ClanPage() {
  const [clanInfo, setClanInfo] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createName, setCreateName] = useState("");
  const [createTag, setCreateTag] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const [treasuryAmount, setTreasuryAmount] = useState("");
  const [treasuryAction, setTreasuryAction] = useState<"deposit" | "withdraw" | null>(null);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadClanData();
  }, []);

  async function loadClanData() {
    setLoading(true);
    setError(null);
    try {
      const infoRes = await getClanInfoAction("");
      if (infoRes.success && infoRes.data) {
        setClanInfo(infoRes.data);
        const membersRes = await getClanMembersAction(infoRes.data.id);
        if (membersRes.success) setMembers(membersRes.data?.members || []);
      }
    } catch {
      setError("Nepodarilo sa načítať údaje klanu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateClan() {
    if (!createName || !createTag) return;
    setCreating(true);
    try {
      const res = await createClanAction(createName, createTag, createDesc || undefined);
      if (res.success) {
        await loadClanData();
      } else {
        setError(res.error || "Chyba pri vytváraní klanu.");
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleSearch() {
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const res = await searchClansAction(searchTerm);
      if (res.success) setSearchResults(res.data?.clans || []);
    } finally {
      setSearching(false);
    }
  }

  async function handleJoinClan(clanId: string) {
    setActionLoading(`join-${clanId}`);
    try {
      const res = await joinClanAction(clanId);
      if (res.success) await loadClanData();
      else setError(res.error || "Chyba pri pripájaní.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleLeave() {
    setActionLoading("leave");
    try {
      const res = await leaveClanAction();
      if (res.success) {
        setClanInfo(null);
        setMembers([]);
      } else {
        setError(res.error || "Chyba pri odchode.");
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleKick(targetId: string) {
    setActionLoading(`kick-${targetId}`);
    try {
      const res = await kickMemberAction(targetId);
      if (res.success) await loadClanData();
      else setError(res.error || "Chyba pri vyhadzovaní.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleTreasury() {
    const amount = Number(treasuryAmount);
    if (!amount || amount <= 0) return;
    setActionLoading("treasury");
    try {
      const res = treasuryAction === "deposit"
        ? await depositToTreasuryAction(amount)
        : await withdrawFromTreasuryAction(amount);
      if (res.success) {
        await loadClanData();
        setTreasuryAmount("");
        setTreasuryAction(null);
      } else {
        setError(res.error || "Chyba v pokladnici.");
      }
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

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!clanInfo) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Klan" subtitle="Pridaj sa k klanu alebo vytvor nový" />

        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent className="py-4 space-y-3">
              <h3 className="text-sm font-semibold text-[#e2e8f0] flex items-center gap-2">
                <Shield className="h-4 w-4" /> Vytvor klan
              </h3>
              <input
                type="text"
                placeholder="Názov klanu"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="w-full bg-[#0d0d1a] border border-[#2a2a4a] rounded px-3 py-2 text-sm text-[#e2e8f0]"
              />
              <input
                type="text"
                placeholder="Tag (skratka)"
                value={createTag}
                onChange={(e) => setCreateTag(e.target.value)}
                className="w-full bg-[#0d0d1a] border border-[#2a2a4a] rounded px-3 py-2 text-sm text-[#e2e8f0]"
              />
              <input
                type="text"
                placeholder="Popis (voliteľné)"
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                className="w-full bg-[#0d0d1a] border border-[#2a2a4a] rounded px-3 py-2 text-sm text-[#e2e8f0]"
              />
              <Button
                variant="primary"
                loading={creating}
                onClick={handleCreateClan}
                disabled={!createName || !createTag}
              >
                Vytvoriť klan
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 space-y-3">
              <h3 className="text-sm font-semibold text-[#e2e8f0] flex items-center gap-2">
                <Search className="h-4 w-4" /> Pripojiť sa k klanu
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Hľadať klan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 bg-[#0d0d1a] border border-[#2a2a4a] rounded px-3 py-2 text-sm text-[#e2e8f0]"
                />
                <Button variant="primary" size="sm" loading={searching} onClick={handleSearch}>
                  Hľadať
                </Button>
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((clan) => (
                    <div key={clan.id} className="flex items-center justify-between bg-[#12121f] rounded px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-[#e2e8f0]">
                          [{clan.tag}] {clan.name}
                        </p>
                        <p className="text-[10px] text-[#64748b]">Úr. {clan.level} · {clan.member_count} členov</p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        loading={actionLoading === `join-${clan.id}`}
                        onClick={() => handleJoinClan(clan.id)}
                      >
                        Pripojiť
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const myRank = members.find((m) => m.is_current)?.rank || "member";
  const canManage = myRank === "leader" || myRank === "officer";
  const xpProgress = clanInfo.xp_to_next_level ? (clanInfo.xp / clanInfo.xp_to_next_level) * 100 : 100;

  return (
    <div className="animate-fade-in">
      <PageHeader title={`${clanInfo.name}`} subtitle={`[${clanInfo.tag}]`} />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-[#64748b]">Úroveň klanu</p>
                <p className="text-2xl font-bold text-[#e2e8f0] tabular-nums">{clanInfo.level}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="default"><Trophy className="h-3 w-3 mr-1" /> {clanInfo.xp} XP</Badge>
                <Badge variant="default"><Coins className="h-3 w-3 mr-1" /> {clanInfo.gold} zlato</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#4a4a6c] mb-1">
              <span>XP</span>
              <span>{clanInfo.xp_to_next_level || "MAX"}</span>
            </div>
            <Progress variant="xp" value={xpProgress} />
          </CardContent>
        </Card>

        {clanInfo.description && (
          <Card>
            <CardContent className="py-3">
              <p className="text-xs text-[#94a3b8]">{clanInfo.description}</p>
            </CardContent>
          </Card>
        )}

        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3 flex items-center gap-2">
            <Users className="h-3 w-3" /> Členovia ({members.length})
          </h3>
          <div className="space-y-2">
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#e2e8f0] truncate">{member.name}</span>
                      <Badge variant="default">Úr. {member.level}</Badge>
                      <Badge variant={member.rank === "leader" ? "uncommon" : member.rank === "officer" ? "default" : "common"}>
                        {RANK_LABELS[member.rank] || member.rank}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-[#64748b] mt-0.5">
                      Príspevok: {member.contribution || 0} zlato
                    </p>
                  </div>
                  {canManage && !member.is_current && member.rank !== "leader" && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={actionLoading === `kick-${member.id}`}
                      onClick={() => handleKick(member.id)}
                    >
                      <UserMinus className="h-3 w-3" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="py-4 space-y-3">
            <h3 className="text-sm font-semibold text-[#e2e8f0] flex items-center gap-2">
              <Coins className="h-4 w-4" /> Pokladnica klanu
            </h3>
            <p className="text-xs text-[#64748b]">Aktuálny stav: <span className="text-[#e2e8f0]">{clanInfo.gold} zlato</span></p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Množstvo"
                value={treasuryAmount}
                onChange={(e) => setTreasuryAmount(e.target.value)}
                className="flex-1 bg-[#0d0d1a] border border-[#2a2a4a] rounded px-3 py-2 text-sm text-[#e2e8f0]"
              />
              <Button
                variant="primary"
                size="sm"
                loading={actionLoading === "treasury" && treasuryAction === "deposit"}
                onClick={() => { setTreasuryAction("deposit"); handleTreasury(); }}
                disabled={!treasuryAmount || Number(treasuryAmount) <= 0}
              >
                <ArrowUpCircle className="h-3 w-3 mr-1" /> Vložiť
              </Button>
              <Button
                variant="secondary"
                size="sm"
                loading={actionLoading === "treasury" && treasuryAction === "withdraw"}
                onClick={() => { setTreasuryAction("withdraw"); handleTreasury(); }}
                disabled={!treasuryAmount || Number(treasuryAmount) <= 0 || !canManage}
              >
                <ArrowDownCircle className="h-3 w-3 mr-1" /> Vybrať
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            variant="danger"
            loading={actionLoading === "leave"}
            onClick={handleLeave}
          >
            <LogOut className="h-3 w-3 mr-1" /> Opustiť klan
          </Button>
        </div>
      </div>
    </div>
  );
}
