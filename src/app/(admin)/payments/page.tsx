"use client";

import { useEffect, useState } from "react";
import { CreditCard, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(false);
    }
    load();
  }, []);

  const statusIcons: Record<string, React.ComponentType<any>> = {
    completed: CheckCircle,
    failed: XCircle,
    pending: Clock,
  };

  const statusColors: Record<string, string> = {
    completed: "#10b981",
    failed: "#dc2626",
    pending: "#fbbf24",
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Platby"
        subtitle="História platieb"
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="h-8 w-8 text-[#4a4a6c] mx-auto mb-2" />
              <p className="text-xs text-[#64748b]">Žiadne platby zatiaľ</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {payments.map((payment) => {
              const StatusIcon =
                statusIcons[payment.status] || Clock;
              return (
                <Card key={payment.id}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: statusColors[payment.status] }}
                      />
                      <div>
                        <p className="text-sm font-medium text-[#e2e8f0]">
                          {payment.description}
                        </p>
                        <p className="text-[10px] text-[#64748b]">
                          {payment.email} ·{" "}
                          {new Date(payment.created_at).toLocaleDateString("sk")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold text-[#e2e8f0]">
                        {payment.amount} {payment.currency}
                      </span>
                      <Badge variant={payment.status === "completed" ? "common" : "danger"}>
                        {payment.status}
                      </Badge>
                    </div>
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
