"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Coins,
  Swords,
  Info,
  CheckCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "@/app/actions/notifications.actions";

const NOTIF_ICONS: Record<string, React.ComponentType<any>> = {
  expedition: Swords,
  pvp: Swords,
  reward: Coins,
  quest: CheckCircle,
  warning: AlertTriangle,
  info: Info,
  default: Bell,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getNotifications();
      if (result.success) setNotifications(result.data?.notifications || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setMarkingAll(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Notifikácie"
        subtitle={unreadCount > 0 ? `${unreadCount} neprečítaných` : "Všetko prečítané"}
        action={
          unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              loading={markingAll}
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Všetko
            </Button>
          ) : undefined
        }
      />

      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-8 w-8 text-[#4a4a6c] mx-auto mb-2" />
              <p className="text-xs text-[#64748b]">
                Žiadne notifikácie
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const Icon = NOTIF_ICONS[notif.type] || NOTIF_ICONS.default;
              return (
                <Card
                  key={notif.id}
                  variant={notif.read ? "default" : "highlighted"}
                  className={!notif.read ? "cursor-pointer" : ""}
                  onClick={() => !notif.read && handleMarkRead(notif.id)}
                >
                  <CardContent className="py-3 flex items-start gap-3">
                    <Icon className="h-4 w-4 text-[#64748b] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#e2e8f0]">
                        {notif.title}
                      </p>
                      <p className="text-[10px] text-[#64748b] mt-0.5">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-[#4a4a6c] mt-1">
                        {new Date(notif.created_at).toLocaleString("sk")}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-[#6366f1] flex-shrink-0 mt-1" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
