"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, Clock, Swords, LogOut, Star, Trophy, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getActiveEventsAction,
  joinEventAction,
  leaveEventAction,
  getEventRankingsAction,
  getCharacterEventStatusAction,
} from "@/app/actions/event.actions";

const EVENT_TYPE_BADGES: Record<string, { label: string; variant: string }> = {
  boss_rush: { label: "Boss útok", variant: "cursed" },
  double_xp: { label: "2x XP", variant: "uncommon" },
  double_gold: { label: "2x Zlato", variant: "default" },
  festival: { label: "Festival", variant: "uncommon" },
  invasion: { label: "Invázia", variant: "cursed" },
  challenge: { label: "Výzva", variant: "default" },
};

const EVENT_DESCRIPTIONS: Record<string, string> = {
  boss_rush: "Porazuj bossov a získavaj špeciálne odmeny.",
  double_xp: "Počas tohto eventu získavaš dvojnásobné skúsenosti.",
  double_gold: "Všetko zlato je zdvojené počas trvania eventu.",
  festival: "Špeciálny festival s exklívnymi odmenami a výzvami.",
  invasion: "Odpieraj nepriateľskú inváziu a chráň svoju ríšu.",
  challenge: "Preukáž svoju silu v špeciálnych výzvach.",
};

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const res = await getActiveEventsAction();
    if (res.success) {
      setEvents(res.data || []);
      for (const ev of res.data || []) {
        const statusRes = await getCharacterEventStatusAction(ev.id);
        if (statusRes.success) {
          setStatuses((prev) => ({ ...prev, [ev.id]: statusRes.data }));
        }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    function update() {
      const next: Record<string, string> = {};
      for (const ev of events) {
        if (!ev.ends_at) continue;
        const diff = new Date(ev.ends_at).getTime() - Date.now();
        if (diff <= 0) {
          next[ev.id] = "Skončené";
          continue;
        }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        next[ev.id] = `${h}h ${m}m ${s}s`;
      }
      setCountdowns(next);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [events]);

  async function handleSelectEvent(eventId: string) {
    setSelectedEvent(eventId);
    setRankings([]);
    const res = await getEventRankingsAction(eventId, 50);
    if (res.success) setRankings(res.data || []);
  }

  async function handleJoin(eventId: string) {
    setJoining(eventId);
    try {
      const res = await joinEventAction(eventId);
      if (res.success) {
        const statusRes = await getCharacterEventStatusAction(eventId);
        if (statusRes.success) {
          setStatuses((prev) => ({ ...prev, [eventId]: statusRes.data }));
        }
      }
    } finally {
      setJoining(null);
    }
  }

  async function handleLeave(eventId: string) {
    setLeaving(eventId);
    try {
      const res = await leaveEventAction(eventId);
      if (res.success) {
        const statusRes = await getCharacterEventStatusAction(eventId);
        if (statusRes.success) {
          setStatuses((prev) => ({ ...prev, [eventId]: statusRes.data }));
        }
      }
    } finally {
      setLeaving(null);
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
      <PageHeader title="Živé eventy" subtitle="Zapoj sa do eventov a získaj odmeny" />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-xs text-[#64748b]">
                Žiadne aktívne eventy. Sleduj novinky!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {events.map((ev) => {
              const badge = EVENT_TYPE_BADGES[ev.event_type] || { label: ev.event_type, variant: "default" };
              const status = statuses[ev.id];
              const isJoined = status?.is_joined;

              return (
                <Card
                  key={ev.id}
                  className={`cursor-pointer transition-colors ${
                    selectedEvent === ev.id ? "bg-[#1a1a2e] border-[#6366f1]" : "hover:bg-[#1a1a2e]"
                  }`}
                  onClick={() => handleSelectEvent(ev.id)}
                >
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#6366f1]" />
                        <Badge variant={badge.variant as any}>{badge.label}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">
                          <Clock className="h-3 w-3 mr-1" />
                          {countdowns[ev.id] || "..."}
                        </Badge>
                        {isJoined ? (
                          <Button
                            variant="danger"
                            size="sm"
                            loading={leaving === ev.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLeave(ev.id);
                            }}
                          >
                            <LogOut className="h-3 w-3 mr-1" />
                            Odísť
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={joining === ev.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoin(ev.id);
                            }}
                          >
                            <Swords className="h-3 w-3 mr-1" />
                            Vstúpiť
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#64748b] mb-2">
                      {EVENT_DESCRIPTIONS[ev.event_type] || "Popis nie je k dispozícii."}
                    </p>

                    {isJoined && status && (
                      <div className="flex items-center gap-3 text-[10px] text-[#4a4a6c]">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Skóre: {status.score ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          Pozícia: {status.rank ?? "-"}
                        </span>
                        {status.reward_claimed && (
                          <Badge variant="uncommon">Odmena prevzatá</Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {selectedEvent && (
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
              <Users className="h-3 w-3 inline mr-1" />
              Rebríček eventu
            </h3>
            {rankings.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-xs text-[#64748b]">Žiadne záznamy v rebríčku.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {rankings.map((entry: any, i: number) => (
                  <Card key={entry.id ?? i}>
                    <CardContent className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#4a4a6c] w-6 text-right">
                          {i + 1}.
                        </span>
                        <p className="text-sm font-medium text-[#e2e8f0]">
                          {entry.character_name ?? entry.name ?? "Neznámy"}
                        </p>
                      </div>
                      <Badge variant="default">{entry.score ?? entry.value ?? 0}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
