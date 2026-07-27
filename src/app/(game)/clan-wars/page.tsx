export default function ClanWarsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground">Klanové vojny</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vyzvi iné klany v asynchrónnych vojnách.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-semibold text-foreground">Aktívne vojny</h3>
          <p className="text-sm text-muted-foreground">Prebiehajúce klanové konflikty.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-semibold text-foreground">Výzvy</h3>
          <p className="text-sm text-muted-foreground">Pošli výzvu inému klanu.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-semibold text-foreground">Výsledky</h3>
          <p className="text-sm text-muted-foreground">História a odmeny.</p>
        </div>
      </div>
    </div>
  )
}
