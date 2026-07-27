"use client";

import { useEffect, useState } from "react";
import { Users, Search, Shield, ArrowUpCircle, ArrowDownCircle, UserMinus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getClanMembersAction,
  promoteMemberAction,
  demoteMemberAction,
  kickMemberAction,
  searchClansAction,
} from "@/app/actions/clan.actions";

const RANK_LABELS: Record<string, string> = {
  leader: "Vodca",
  officer: "Dôstojník",
  member: "Člen",
};

export default function ClanMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [clanInfo, setClanInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteResults, setInviteResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    setError(null);
    try {
      const infoRes = await searchClansAction("");
      const membersRes = await getClanMembersAction("");
      if (membersRes.success) setMembers(membersRes.data?.members || []);
      if (infoRes.success && infoRes.data?.clans?.length) {
        setClanInfo(infoRes.data.clans[0]);
      }
    } catch {
      setError("Nepodarilo sa načítať členov.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePromote(targetId: string) {
    setActionLoading(`promote-${targetId}`);
    try {
      const res = await promoteMemberAction(targetId);
      if (res.success) await loadMembers();
      else setError(res.error || "Chyba pri povýšení.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDemote(targetId: string) {
    setActionLoading(`demote-${targetId}`);
    try {
      const res = await demoteMemberAction(targetId);
      if (res.success) await loadMembers();
      else setError(res.error || "Chyba pri znížení hodnosti.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleKick(targetId: string) {
    setActionLoading(`kick-${targetId}`);
    try {
      const res = await kickMemberAction(targetId);
      if (res.success) await loadMembers();
      else setError(res.error || "Chyba pri vyhadzovaní.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleInviteSearch() {
    if (!inviteSearch.trim()) return;
    setSearching(true);
    try {
      const res = await searchClansAction(inviteSearch);
      if (res.success) setInviteResults(res.data?.clans || []);
    } finally {
      setSearching(false);
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

  const myRank = members.find((m) => m.is_current)?.rank || "member";
  const canManage = myRank === "leader" || myRank === "officer";

  return (
    <div className="animate-fade-in">
      <PageHeader title="Členovia klanu" subtitle="Správa členov a pozvánky" />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3 flex items-center gap-2">
            <Users className="h-3 w-3" /> Zoznam členov ({members.length})
          </h3>
          {members.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-xs text-[#64748b]">Žiadni členovia v klane.</p>
              </CardContent>
            </Card>
          ) : (
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
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] text-[#64748b]">
                          Príspevok: {member.contribution || 0} zlato
                        </p>
                        {member.last_active && (
                          <p className="text-[10px] text-[#64748b]">
                            Naposledy: {new Date(member.last_active).toLocaleDateString("sk")}
                          </p>
                        )}
                      </div>
                    </div>
                    {canManage && !member.is_current && member.rank !== "leader" && (
                      <div className="flex gap-1">
                        {myRank === "leader" && member.rank !== "officer" && (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={actionLoading === `promote-${member.id}`}
                            onClick={() => handlePromote(member.id)}
                          >
                            <ArrowUpCircle className="h-3 w-3" />
                          </Button>
                        )}
                        {myRank === "leader" && member.rank !== "member" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            loading={actionLoading === `demote-${member.id}`}
                            onClick={() => handleDemote(member.id)}
                          >
                            <ArrowDownCircle className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          loading={actionLoading === `kick-${member.id}`}
                          onClick={() => handleKick(member.id)}
                        >
                          <UserMinus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {canManage && (
          <Card>
            <CardContent className="py-4 space-y-3">
              <h3 className="text-sm font-semibold text-[#e2e8f0] flex items-center gap-2">
                <Search className="h-4 w-4" /> Pozvať člena
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Hľadať podľa mena postavy..."
                  value={inviteSearch}
                  onChange={(e) => setInviteSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInviteSearch()}
                  className="flex-1 bg-[#0d0d1a] border border-[#2a2a4a] rounded px-3 py-2 text-sm text-[#e2e8f0]"
                />
                <Button variant="primary" size="sm" loading={searching} onClick={handleInviteSearch}>
                  Hľadať
                </Button>
              </div>
              {inviteResults.length > 0 && (
                <div className="space-y-2">
                  {inviteResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between bg-[#12121f] rounded px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-[#e2e8f0]">{result.name}</p>
                        <p className="text-[10px] text-[#64748b]">Úr. {result.level}</p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        loading={actionLoading === `invite-${result.id}`}
                        onClick={() => handleInviteSearch()}
                      >
                        <Shield className="h-3 w-3 mr-1" /> Pozvať
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
