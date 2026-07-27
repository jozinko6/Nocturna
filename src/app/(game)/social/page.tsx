"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  UserX,
  Shield,
  ShieldOff,
  MessageSquare,
  Search,
  Check,
  X,
  Trash2,
  UserMinus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getFriendListAction,
  getPendingFriendRequestsAction,
  getBlockedListAction,
  sendFriendRequestAction,
  acceptFriendRequestAction,
  rejectFriendRequestAction,
  removeFriendAction,
  blockPlayerAction,
  unblockPlayerAction,
} from "@/app/actions/social.actions";

export default function SocialPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [blocked, setBlocked] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [friendRes, pendingRes, blockedRes] = await Promise.all([
      getFriendListAction(),
      getPendingFriendRequestsAction(),
      getBlockedListAction(),
    ]);
    if (friendRes.success) setFriends(friendRes.data || []);
    if (pendingRes.success) setPendingRequests(pendingRes.data || []);
    if (blockedRes.success) setBlocked(blockedRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSendFriendRequest() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const result = await sendFriendRequestAction(searchQuery.trim());
      if (result.success) {
        setSearchQuery("");
        await loadData();
      }
    } finally {
      setSearching(false);
    }
  }

  async function handleAccept(friendshipId: string) {
    setActionLoading(friendshipId);
    try {
      const result = await acceptFriendRequestAction(friendshipId);
      if (result.success) await loadData();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(friendshipId: string) {
    setActionLoading(friendshipId);
    try {
      const result = await rejectFriendRequestAction(friendshipId);
      if (result.success) await loadData();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemoveFriend(friendId: string) {
    setActionLoading(friendId);
    try {
      const result = await removeFriendAction(friendId);
      if (result.success) await loadData();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleBlock(targetId: string) {
    setActionLoading(targetId);
    try {
      const result = await blockPlayerAction(targetId);
      if (result.success) await loadData();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnblock(targetId: string) {
    setActionLoading(targetId);
    try {
      const result = await unblockPlayerAction(targetId);
      if (result.success) await loadData();
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

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Sociálny systém"
        subtitle="Priatelia, správy a blokovanie"
        action={
          <Link href="/social/messages">
            <Button variant="secondary" size="sm">
              <MessageSquare className="h-3 w-3" />
              Správy
            </Button>
          </Link>
        }
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <Card>
          <CardContent className="py-3">
            <div className="flex gap-2">
              <Input
                placeholder="Meno postavy alebo ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendFriendRequest()}
              />
              <Button
                variant="primary"
                size="sm"
                loading={searching}
                onClick={handleSendFriendRequest}
                disabled={!searchQuery.trim()}
              >
                <UserPlus className="h-3 w-3" />
                Pridať
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="friends" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="friends">
              <Users className="h-3 w-3 mr-1.5" />
              Priatelia
              {friends.length > 0 && (
                <Badge variant="default" className="ml-1.5">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests">
              <UserPlus className="h-3 w-3 mr-1.5" />
              Žiadosti
              {pendingRequests.length > 0 && (
                <Badge variant="lunari" className="ml-1.5">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="blocked">
              <Shield className="h-3 w-3 mr-1.5" />
              Blokovaní
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            {friends.length === 0 ? (
              <EmptyState
                icon={<Users className="h-6 w-6" />}
                title="Žiadni priatelia"
                description="Pridaj priateľov pomocou vyhľadávania vyššie."
              />
            ) : (
              <div className="space-y-2">
                {friends.map((friend: any) => (
                  <Card key={friend.id}>
                    <CardContent className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative">
                          <div className="h-8 w-8 rounded-sm bg-[#1a1a2e] border border-[#2a2a44] flex items-center justify-center text-[#94a3b8] text-xs font-medium">
                            {friend.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0e0e1a] ${
                              friend.is_online
                                ? "bg-[#4ade80]"
                                : "bg-[#4a4a6c]"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#e2e8f0] truncate">
                            {friend.name}
                          </p>
                          <p className="text-[10px] text-[#64748b]">
                            {friend.is_online ? "Online" : "Offline"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link href={`/social/messages?start=${friend.character_id || friend.id}`}>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={actionLoading === friend.id}
                          onClick={() => handleRemoveFriend(friend.friendship_id || friend.id)}
                        >
                          <UserMinus className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests">
            {pendingRequests.length === 0 ? (
              <EmptyState
                icon={<UserPlus className="h-6 w-6" />}
                title="Žiadne žiadosti"
                description="Nemáš žiadne nové žiadosti o priateľstvo."
              />
            ) : (
              <div className="space-y-2">
                {pendingRequests.map((req: any) => (
                  <Card key={req.id}>
                    <CardContent className="py-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#e2e8f0] truncate">
                          {req.from_character_name || req.sender_name || "Neznámy"}
                        </p>
                        <p className="text-[10px] text-[#64748b]">
                          {req.created_at
                            ? new Date(req.created_at).toLocaleDateString("sk")
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="primary"
                          size="sm"
                          loading={actionLoading === req.id}
                          onClick={() => handleAccept(req.friendship_id || req.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={actionLoading === req.id}
                          onClick={() => handleReject(req.friendship_id || req.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="blocked">
            {blocked.length === 0 ? (
              <EmptyState
                icon={<Shield className="h-6 w-6" />}
                title="Žiadni blokovaní"
                description="Nemáš žiadnych blokovaných hráčov."
              />
            ) : (
              <div className="space-y-2">
                {blocked.map((player: any) => (
                  <Card key={player.id}>
                    <CardContent className="py-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#e2e8f0] truncate">
                          {player.name || player.blocked_name || "Neznámy"}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={actionLoading === player.id}
                        onClick={() =>
                          handleUnblock(player.blocked_character_id || player.id)
                        }
                      >
                        <ShieldOff className="h-3 w-3" />
                        Odblokovať
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
