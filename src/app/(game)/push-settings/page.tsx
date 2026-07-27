export default function PushSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground">Push notifikácie</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nastav, ktoré notifikácie chceš dostávať.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        {[
          { label: 'Dokončená výprava', key: 'expedition' },
          { label: 'Dokončený crafting', key: 'crafting' },
          { label: 'Klanová vojna', key: 'clan_war' },
          { label: 'Aukčný predaj', key: 'auction' },
          { label: 'Sezóna a eventy', key: 'season' },
        ].map(pref => (
          <label key={pref.key} className="flex items-center justify-between">
            <span className="text-sm text-foreground">{pref.label}</span>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </label>
        ))}
      </div>
    </div>
  )
}
