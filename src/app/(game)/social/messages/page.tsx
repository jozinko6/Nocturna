"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { getConversationsAction } from "@/app/actions/social.actions";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getConversationsAction();
      if (result.success) setConversations(result.data || []);
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

  return (
    <div className="animate-fade-in">
      <PageHeader title="Správy" subtitle="Tvoje konverzácie" />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        {conversations.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-6 w-6" />}
            title="Žiadne konverzácie"
            description="Začni konverzáciu s priateľom zo zoznamu priateľov."
          />
        ) : (
          <div className="space-y-2">
            {conversations.map((conv: any) => {
              const otherName =
                conv.other_character_name || conv.recipient_name || "Neznámy";
              const unread = conv.unread_count || 0;
              const lastMessage = conv.last_message || conv.last_content || "";
              const lastAt = conv.last_message_at || conv.updated_at;

              return (
                <Link key={conv.id} href={`/social/messages/${conv.id}`}>
                  <Card className="hover:bg-[#1a1a2e] transition-colors cursor-pointer">
                    <CardContent className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-sm bg-[#1a1a2e] border border-[#2a2a44] flex items-center justify-center text-[#94a3b8] text-sm font-medium flex-shrink-0">
                          {otherName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-[#e2e8f0] truncate">
                              {otherName}
                            </p>
                            {lastAt && (
                              <p className="text-[10px] text-[#4a4a6c] flex-shrink-0">
                                {new Date(lastAt).toLocaleDateString("sk")}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-[#64748b] truncate">
                              {lastMessage || "Žiadne správy"}
                            </p>
                            {unread > 0 && (
                              <Badge variant="lunari" className="flex-shrink-0">
                                {unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#4a4a6c] flex-shrink-0 ml-2" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
