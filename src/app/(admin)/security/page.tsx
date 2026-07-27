"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  AlertTriangle,
  Ban,
  Eye,
  Clock,
  User,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminSecurityPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(false);
    }
    load();
  }, []);

  const filteredEvents = events.filter(
    (e) =>
      e.description?.toLowerCase().includes(search.toLowerCase()) ||
      e.player_email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Bezpečnosť"
        subtitle="Bezpečnostné udalosti"
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4a4a6c]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hľadať v udalostiach..."
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-8 w-8 text-[#4a4a6c] mx-auto mb-2" />
              <p className="text-xs text-[#64748b]">
                {search
                  ? "Žiadne udalosti nenájdené"
                  : "Žiadne bezpečnostné udalosti"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="py-3 flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-[#f97316] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#e2e8f0]">
                      {event.type}
                    </p>
                    <p className="text-[10px] text-[#64748b] mt-0.5">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-[#4a4a6c] flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {event.player_email || "Systém"}
                      </span>
                      <span className="text-[10px] text-[#4a4a6c] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(event.created_at).toLocaleString("sk")}
                      </span>
                    </div>
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
