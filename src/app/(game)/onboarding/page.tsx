"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, ChevronRight, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { createCharacter, getFactions } from "@/app/actions/character.actions";
import { PORTRAITS } from "@/game/onboarding";

const STEPS = ["Frakcia", "Meno", "Portrét", "Prvá výprava"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [factions, setFactions] = useState<any[]>([]);
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
  const [characterName, setCharacterName] = useState("");
  const [nameError, setNameError] = useState("");
  const [selectedPortrait, setSelectedPortrait] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await getFactions();
        if (result.success) {
          setFactions(result.data?.factions || []);
        } else {
          setError(result.error || "Nepodarilo sa načítať frakcie.");
        }
      } catch {
        setError("Nepodarilo sa načítať frakcie.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function validateName(name: string): boolean {
    if (name.length < 3) {
      setNameError("Meno musí mať aspoň 3 znaky");
      return false;
    }
    if (name.length > 20) {
      setNameError("Meno môže mať max. 20 znakov");
      return false;
    }
    setNameError("");
    return true;
  }

  async function handleCreate() {
    if (!selectedFaction || !selectedPortrait) return;
    if (!validateName(characterName)) return;

    setCreating(true);
    setError("");
    try {
      const result = await createCharacter(
        characterName,
        selectedFaction,
        selectedPortrait
      );
      if (result.success) {
        router.push("/expeditions");
        router.refresh();
      } else {
        setError(result.error || "Nepodarilo sa vytvoriť postavu.");
      }
    } catch {
      setError("Nastala neočakávaná chyba.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const selectedFactionData = factions.find((f) => f.id === selectedFaction);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6366f1]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#dc2626]/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-sm bg-[#12121e] border border-[#2a2a44] mb-4">
            <Shield className="h-7 w-7 text-[#6366f1]" />
          </div>
          <h1 className="text-2xl font-bold text-[#e2e8f0] tracking-tight">
            Nocturna
          </h1>
          <p className="text-sm text-[#64748b] mt-1">
            Vytvor svoju postavu
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                  i < step
                    ? "bg-[#6366f1] border-[#6366f1] text-white"
                    : i === step
                    ? "bg-[#1a1a2e] border-[#6366f1] text-[#e2e8f0]"
                    : "bg-[#12121e] border-[#2a2a44] text-[#4a4a6c]"
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${
                    i < step ? "bg-[#6366f1]" : "bg-[#2a2a44]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-sm bg-[#2a1215] border border-[#5c2a2e] text-xs text-[#fca5a5]">
            {error}
          </div>
        )}

        <div className="bg-[#12121e] border border-[#2a2a44] rounded-sm p-6">
          {step === 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[#e2e8f0] mb-1">
                Vyber si frakciu
              </h2>
              <p className="text-xs text-[#64748b] mb-5">
                Tvoja frakcia ovplyvní tvoj štýl hry
              </p>
              <div className="space-y-3">
                {factions.map((faction) => (
                  <Card
                    key={faction.id}
                    variant={selectedFaction === faction.id ? "highlighted" : "default"}
                    className={`cursor-pointer transition-all hover:border-[#4a4a6c] ${
                      selectedFaction === faction.id ? "game-glow-indigo" : ""
                    }`}
                    onClick={() => setSelectedFaction(faction.id)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-[#e2e8f0]">
                          {faction.name}
                        </h3>
                        {selectedFaction === faction.id && (
                          <Check className="h-4 w-4 text-[#6366f1]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#64748b] leading-relaxed mb-3">
                        {faction.lore}
                      </p>
                      <div className="space-y-1">
                        {faction.passives?.map((p: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-[10px]">
                            <span className="text-[#4ade80]">&#9670;</span>
                            <span className="text-[#94a3b8]">{p.description}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full mt-4"
                disabled={!selectedFaction}
                onClick={() => setStep(1)}
              >
                Pokračovať
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-[#e2e8f0] mb-1">
                Zadaj meno postavy
              </h2>
              <p className="text-xs text-[#64748b] mb-5">
                Meno musí byť jedinečné a mať 3–20 znakov
              </p>
              <Input
                label="Meno postavy"
                placeholder="Tvoje meno vo svete temnoty"
                value={characterName}
                onChange={(e) => {
                  setCharacterName(e.target.value);
                  if (nameError) validateName(e.target.value);
                }}
                error={nameError}
                required
              />
              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setStep(0)}
                >
                  Späť
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  disabled={!characterName.trim()}
                  onClick={() => {
                    if (validateName(characterName)) setStep(2);
                  }}
                >
                  Pokračovať
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-[#e2e8f0] mb-1">
                Vyber si portrét
              </h2>
              <p className="text-xs text-[#64748b] mb-5">
                Tvár, ktorá ťa bude sprevádzať temnotou
              </p>
              <div className="grid grid-cols-2 gap-3">
                {PORTRAITS.map((portrait) => (
                  <Card
                    key={portrait.id}
                    variant={selectedPortrait === portrait.url ? "highlighted" : "default"}
                    className={`cursor-pointer transition-all hover:border-[#4a4a6c] relative ${
                      selectedPortrait === portrait.url ? "game-glow-indigo" : ""
                    }`}
                    onClick={() => setSelectedPortrait(portrait.url)}
                  >
                    <CardContent className="py-3 text-center">
                      <div className="w-16 h-16 mx-auto rounded-sm bg-[#1a1a2e] border border-[#2a2a44] flex items-center justify-center mb-2 overflow-hidden">
                        <Shield className="h-8 w-8 text-[#64748b]" />
                      </div>
                      <span className="text-xs font-medium text-[#e2e8f0]">
                        {portrait.name}
                      </span>
                      {selectedPortrait === portrait.url && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-[#6366f1]" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setStep(1)}
                >
                  Späť
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  disabled={!selectedPortrait}
                  onClick={() => setStep(3)}
                >
                  Pokračovať
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-[#e2e8f0] mb-1">
                Pripravený?
              </h2>
              <p className="text-xs text-[#64748b] mb-5">
                Tvoja postava je takmer hotová. Dokonči vytvorenie a začni svoju cestu.
              </p>

              <Card className="mb-4">
                <CardContent className="py-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#64748b]">Meno</span>
                      <span className="text-xs text-[#e2e8f0] font-medium">
                        {characterName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#64748b]">Frakcia</span>
                      <Badge variant="default">
                        {selectedFactionData?.name}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#64748b]">Portrét</span>
                      <span className="text-xs text-[#e2e8f0]">
                        {PORTRAITS.find((p) => p.url === selectedPortrait)?.name}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="highlighted" className="mb-4">
                <CardContent className="py-3">
                  <p className="text-xs text-[#94a3b8] leading-relaxed">
                    Po vytvorení postavy dostaneš svoju prvú výpravu do{" "}
                    <span className="text-[#e2e8f0] font-medium">Mesta bez svitania</span>{" "}
                    — bezpečnú misiu, kde sa naučíš základy boja.
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setStep(2)}
                >
                  Späť
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  loading={creating}
                  onClick={handleCreate}
                >
                  Vytvoriť postavu
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
