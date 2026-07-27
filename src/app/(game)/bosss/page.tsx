export default function BossesPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground">Regionálni bossovia</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Poraz bossov v rôznych regiónoch a získaj exkluzívne odmeny.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { name: 'Pán stok', region: 'Mesto bez svitania', level: 15, mechanics: 'Jed, malé príšery' },
          { name: 'Matka koreňov', region: 'Čierny les', level: 25, mechanics: 'Regenerácia, korene' },
          { name: 'Archivár bez tváre', region: 'Krypty Prvých', level: 35, mechanics: 'Kopírovanie, kliatby' },
          { name: 'Strážca koróny', region: 'Mesačné vrchy', level: 45, mechanics: 'Fázy, vysoká obrana' },
        ].map(boss => (
          <div key={boss.name} className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-foreground">{boss.name}</h3>
            <p className="text-xs text-muted-foreground">{boss.region} • Úroveň {boss.level}</p>
            <p className="text-sm text-muted-foreground mt-1">{boss.mechanics}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
