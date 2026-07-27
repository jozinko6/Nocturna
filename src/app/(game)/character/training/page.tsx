"use client";

import { useEffect, useState } from "react";
import { Swords, Shield, Eye, Zap, Heart, Clover, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getCharacter, getCharacterStats } from "@/app/actions/character.actions";
import { trainAttribute } from "@/app/actions/training.actions";
import { trainingCost } from "@/game/formulas";

const ATTRIBUTES = [
  { key: "strength" as const, name: "Sila", icon: Swords, color: "text-[#dc2626]" },
  { key: "dexterity" as const, name: "Obratnosť", icon: Zap, color: "text-[#22c55e]" },
  { key: "endurance" as const, name: "Vytrvalosť", icon: Shield, color: "text-[#3b82f6]" },
  { key: "perception" as const, name: "Vnímanie", icon: Eye, color: "text-[#a855f7]" },
  { key: "willpower" as const, name: "Vôľa", icon: Heart, color: "text-[#f59e0b]" },
  { key: "luck" as const, name: "Šťastie", icon: Clover, color: "text-[#6366f1]" },
];

export default function TrainingPage() {
  const [stats, setStats] = useState<any>(null);
  const [gold, setGold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    attr: (typeof ATTRIBUTES)[number] | null;
  }>({ open: false, attr: null });

  useEffect(() => {
    async function load() {
      const [charRes, statsRes] = await Promise.all([
        getCharacter(),
        getCharacterStats(),
      ]);
      if (charRes.success) {
        setGold(charRes.data?.character?.gold ?? 0);
      }
      if (statsRes.success) {
        setStats(statsRes.data?.stats);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleTrain(attr: (typeof ATTRIBUTES)[number]) {
    setTraining(attr.key);
    try {
      const result = await trainAttribute(attr.key);
      if (result.success && result.data) {
        setStats((prev: any) => ({
          ...prev,
          [attr.key]: result.data!.newLevel,
        }));
        setGold(result.data.remainingGold);
      }
    } finally {
      setTraining(null);
      setConfirmModal({ open: false, attr: null });
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
        title="Tréningová komnata"
        subtitle="Vylepši svoje atribúty za zlaté"
      />

      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <Card>
          <CardContent className="py-3 flex items-center justify-between">
            <span className="text-xs text-[#94a3b8]">Dostupné zlaté</span>
            <span className="text-lg font-bold text-[#f59e0b] tabular-nums">
              {gold}
            </span>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {ATTRIBUTES.map((attr) => {
            const value = stats?.[attr.key] ?? 0;
            const cost = trainingCost(value);
            const canAfford = gold >= cost;
            const isTraining = training === attr.key;

            return (
              <Card key={attr.key}>
                <CardContent className="py-3 flex items-center gap-3">
                  <attr.icon className={`h-5 w-5 ${attr.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#e2e8f0]">
                        {attr.name}
                      </span>
                      <span className="text-lg font-bold text-[#e2e8f0] tabular-nums">
                        {value}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[10px] text-[#64748b] tabular-nums mb-1">
                      {cost} zlatých
                    </p>
                    <Button
                      variant={canAfford ? "primary" : "secondary"}
                      size="sm"
                      disabled={!canAfford || isTraining}
                      loading={isTraining}
                      onClick={() =>
                        setConfirmModal({ open: true, attr })
                      }
                    >
                      Trénovať
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Modal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, attr: null })}
        title="Potvrdenie tréningu"
      >
        {confirmModal.attr && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-[#f59e0b]" />
              <p className="text-sm text-[#e2e8f0]">
                Naozaj chceš trénovať{" "}
                <span className="font-semibold">{confirmModal.attr.name}</span>?
              </p>
            </div>
            <p className="text-xs text-[#64748b] mb-4">
              Bude ti stratených{" "}
              <span className="text-[#f59e0b] font-medium">
                {trainingCost(stats?.[confirmModal.attr.key] ?? 0)} zlatých
              </span>
            </p>
            <ModalFooter>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmModal({ open: false, attr: null })}
              >
                Zrušiť
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={training === confirmModal.attr.key}
                onClick={() => handleTrain(confirmModal.attr!)}
              >
                Potvrdiť
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
}
