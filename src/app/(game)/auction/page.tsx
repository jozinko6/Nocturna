export default function AuctionPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground">Aukcia</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kupuj a predávaj predmety a materiály s ostatnými hráčmi.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-semibold text-foreground">Ponuky</h3>
          <p className="text-sm text-muted-foreground">Prehľad aktívnych ponúk.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-semibold text-foreground">Moje ponuky</h3>
          <p className="text-sm text-muted-foreground">Spravuj svoje inzeráty.</p>
        </div>
      </div>
    </div>
  )
}
