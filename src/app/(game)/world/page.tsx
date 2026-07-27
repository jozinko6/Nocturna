export default function WorldMapPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground">Svetová mapa</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Prehliadaj regióny Nocturny, územia a frakčné ciele.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { name: 'Mesto bez svitania', level: '1-20' },
          { name: 'Čierny les', level: '15-30' },
          { name: 'Krypty Prvých', level: '25-40' },
          { name: 'Mesačné vrchy', level: '35-50' },
          { name: 'Krvavé močiare', level: '20-35' },
          { name: 'Pobrežie prázdnych lodí', level: '30-45' },
          { name: 'Koruna zatmenia', level: '45-50' },
        ].map(region => (
          <div key={region.name} className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-foreground">{region.name}</h3>
            <p className="text-xs text-muted-foreground">Úroveň {region.level}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
