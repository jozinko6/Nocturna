export default function CraftingPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground">Dielňa</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vyrábaj zbrane, brnenia a predmety z materiálov.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-semibold text-foreground">Recepty</h3>
          <p className="text-sm text-muted-foreground">Odomknuté recepty na craftenie.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-semibold text-foreground">Aktívne</h3>
          <p className="text-sm text-muted-foreground">Prebiehajúce craftovanie.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-semibold text-foreground">Vylepšenie</h3>
          <p className="text-sm text-muted-foreground">Vylepšuj svoju výbavu.</p>
        </div>
      </div>
    </div>
  )
}
