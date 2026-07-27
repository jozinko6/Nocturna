"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Volume2, Bell, Shield, Trash2, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { signOut } from "@/app/actions/auth.actions";

export default function SettingsPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<"sk" | "en">("sk");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOut();
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Nastavenia" subtitle="Prispôsob si hru" />

      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
            Jazyk
          </h3>
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#64748b]" />
                  <span className="text-sm text-[#e2e8f0]">Jazyk rozhrania</span>
                </div>
                <div className="flex gap-1">
                  {(["sk", "en"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-3 py-1 text-xs rounded-sm border transition-colors ${
                        language === lang
                          ? "bg-[#1a1a2e] text-[#e2e8f0] border-[#3a3a5c]"
                          : "bg-transparent text-[#64748b] border-[#2a2a44] hover:text-[#94a3b8]"
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
            Zvuk a notifikácie
          </h3>
          <div className="space-y-2">
            <Card>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-[#64748b]" />
                  <span className="text-sm text-[#e2e8f0]">Zvuky</span>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    soundEnabled ? "bg-[#6366f1]" : "bg-[#2a2a44]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      soundEnabled ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#64748b]" />
                  <span className="text-sm text-[#e2e8f0]">Push notifikácie</span>
                </div>
                <button
                  onClick={() => setNotifEnabled(!notifEnabled)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    notifEnabled ? "bg-[#6366f1]" : "bg-[#2a2a44]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      notifEnabled ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
            Súkromie
          </h3>
          <div className="space-y-2">
            <Card>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#64748b]" />
                  <span className="text-sm text-[#e2e8f0]">Analytika</span>
                </div>
                <button
                  onClick={() => setAnalyticsConsent(!analyticsConsent)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    analyticsConsent ? "bg-[#6366f1]" : "bg-[#2a2a44]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      analyticsConsent ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#64748b]" />
                  <span className="text-sm text-[#e2e8f0]">Marketing</span>
                </div>
                <button
                  onClick={() => setMarketingConsent(!marketingConsent)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    marketingConsent ? "bg-[#6366f1]" : "bg-[#2a2a44]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      marketingConsent ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#4a4a6c] mb-3">
            Účet
          </h3>
          <div className="space-y-2">
            <Card>
              <CardContent className="py-3">
                <div className="flex items-center gap-2 mb-3">
                  <Download className="h-4 w-4 text-[#64748b]" />
                  <span className="text-sm text-[#e2e8f0]">GDPR export</span>
                </div>
                <Button variant="secondary" size="sm">
                  Stiahnuť dáta
                </Button>
              </CardContent>
            </Card>
            <Card variant="danger">
              <CardContent className="py-3">
                <div className="flex items-center gap-2 mb-3">
                  <Trash2 className="h-4 w-4 text-[#dc2626]" />
                  <span className="text-sm text-[#fca5a5]">Zmazať účet</span>
                </div>
                <p className="text-[10px] text-[#64748b] mb-3">
                  Táto akcia je nevratná. Všetky tvoje údaje budú zmazané.
                </p>
                <Button variant="danger" size="sm">
                  Zmazať účet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="pt-4 border-t border-[#2a2a44]">
          <Button
            variant="secondary"
            size="lg"
            loading={loggingOut}
            onClick={handleLogout}
            className="w-full"
          >
            Odhlásiť sa
          </Button>
        </div>
      </div>
    </div>
  );
}
