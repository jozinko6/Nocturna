export default function MaterialsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground">Materiály</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Svoje zhromaždené materiály a inventár komponentov.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {['Kov', 'Koža', 'Drevo', 'Esencia', 'Runa', 'Reliktný fragment', 'Boss materiál', 'Event materiál'].map(cat => (
          <div key={cat} className="rounded-lg border border-border bg-card p-3 text-center">
            <div className="text-sm font-medium text-foreground">{cat}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
