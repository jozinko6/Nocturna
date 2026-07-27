export default function StoryPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground">Kronika zatmenia</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hlavná príbehová kampaň. Dokončuj misie, rob rozhodnutia a objavuj tajomstvá sveta Nocturny.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold text-foreground">Prológ — Stopy v daždi</h2>
          <p className="text-sm text-muted-foreground">Úvod do sveta a frakcií.</p>
          <div className="mt-3 text-xs text-muted-foreground">3 misie</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold text-foreground">Kapitola 1 — Mesto bez svitania</h2>
          <p className="text-sm text-muted-foreground">Zmiznutia, pašeráci a prvé dôkazy.</p>
          <div className="mt-3 text-xs text-muted-foreground">5 misií</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold text-foreground">Kapitola 2 — Čierny les</h2>
          <p className="text-sm text-muted-foreground">Poškodená príroda a morálne rozhodnutia.</p>
          <div className="mt-3 text-xs text-muted-foreground">5 misií</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold text-foreground">Kapitola 3 — Krypty Prvých</h2>
          <p className="text-sm text-muted-foreground">Pôvod frakcií a zrada.</p>
          <div className="mt-3 text-xs text-muted-foreground">5 misií</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold text-foreground">Kapitola 4 — Mesačné vrchy</h2>
          <p className="text-sm text-muted-foreground">Občiansky konflikt a klanové záujmy.</p>
          <div className="mt-3 text-xs text-muted-foreground">4 misie</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold text-foreground">Kapitola 5 — Koruna zatmenia</h2>
          <p className="text-sm text-muted-foreground">Finálny útok a rozhodnutie o zariadení.</p>
          <div className="mt-3 text-xs text-muted-foreground">3 misie</div>
        </div>
      </div>
    </div>
  )
}
