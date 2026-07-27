import Link from "next/link";
import { Swords, Shield, Map, Trophy, Crown, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslation } from "@/lib/i18n";

const locale = "sk";
const t = (key: string) => getTranslation(locale, key);

const features = [
  {
    icon: Swords,
    title: "Expedície",
    description: "Preskúmaj temné regióny, poraz nepriateľov a získaj odmeny.",
  },
  {
    icon: Shield,
    title: "Výstroj",
    description: "Vybav svoju postavu zbraňami a brnením z rôznych vzácností.",
  },
  {
    icon: Map,
    title: "Úkryt",
    description: "Postav a vylepšuj budovy, ktoré ti dajú trvalé bonusy.",
  },
  {
    icon: Trophy,
    title: "PvP Aréna",
    description: "Meraj sa s ostatnými hráčmi v súbojoch o rebríčky.",
  },
  {
    icon: Crown,
    title: "Denné odmeny",
    description: "Prihlasuj sa každý deň a zberaj bonusy za vernosť.",
  },
  {
    icon: Skull,
    title: "Temný príbeh",
    description: "Ponor sa do sveta, kde slnko nikdy nevychádza.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e2e8f0] flex flex-col">
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[#2a2a44]/50">
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-[#6366f1]" />
          <span className="text-sm font-bold tracking-wider uppercase">Nocturna</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              {t("ui.login")}
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              {t("ui.register")}
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="relative flex-1 flex flex-col items-center justify-center px-6 py-20 md:py-32 particle-field">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#6366f1]/[0.03] rounded-full blur-[150px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#8b0000]/[0.04] rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 text-center max-w-2xl animate-fade-in">
            <div className="inline-block mb-6 px-4 py-1.5 rounded-sm bg-[#12121e] border border-[#2a2a44] text-xs text-[#64748b] uppercase tracking-widest">
              Temná fantasy RPG
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 game-text-shadow">
              NOCTURNA
            </h1>
            <p className="text-lg md:text-xl text-[#64748b] mb-10 max-w-lg mx-auto leading-relaxed">
              {t("game.tagline")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Začať dobrodružstvo
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  {t("ui.login")}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="relative z-10 px-6 py-16 md:py-24 border-t border-[#2a2a44]/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center text-sm uppercase tracking-widest text-[#4a4a6c] mb-12">
              Čo ťa čaká
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group p-5 rounded-sm border border-[#2a2a44]/50 bg-[#0e0e1a] hover:bg-[#12121e] hover:border-[#3a3a5c]/50 transition-colors"
                >
                  <feature.icon className="h-5 w-5 text-[#6366f1] mb-3 group-hover:text-[#818cf8] transition-colors" />
                  <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 px-6 py-16 border-t border-[#2a2a44]/30">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-lg font-semibold text-[#e2e8f0] mb-3">
              Pripravený vstúpiť do temnoty?
            </h2>
            <p className="text-sm text-[#64748b] mb-6">
              Vytvor si postavu a začni svoju cestu.
            </p>
            <Link href="/register">
              <Button variant="primary" size="lg" className="w-full">
                Registrovať sa zadarmo
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 px-6 py-6 border-t border-[#2a2a44]/30">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#4a4a6c]">
            <Swords className="h-3.5 w-3.5" />
            <span>Nocturna &copy; 2026</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#4a4a6c]">
            <a href="#" className="hover:text-[#94a3b8] transition-colors">
              Podmienky
            </a>
            <a href="#" className="hover:text-[#94a3b8] transition-colors">
              Súkromie
            </a>
            <a href="#" className="hover:text-[#94a3b8] transition-colors">
              Kontakt
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
