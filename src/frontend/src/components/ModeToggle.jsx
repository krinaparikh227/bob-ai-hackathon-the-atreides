/**
 * ModeToggle — switches between Signal Detection and Submission Readiness modes.
 * Recessed track with raised tactile tab elevation matching prototype.
 */
export default function ModeToggle({ mode, onChange, modes }) {
  const tabs = [
    {
      key: modes.SIGNAL,
      label: 'Signal Detection',
      icon: 'query_stats',
    },
    {
      key: modes.DOSSIER,
      label: 'Submission Readiness',
      icon: 'verified',
    },
  ]

  return (
    <div className="inline-flex rounded-xl p-1 gap-1 bg-[#eff4ff] neu-inset">
      {tabs.map(tab => {
        const isActive = mode === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${
              isActive
                ? 'bg-surface text-primary neu-raised-sm shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface/50'
            }`}
          >
            <span className={`material-symbols-outlined text-lg ${isActive ? 'text-primary' : 'text-outline'}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {tab.icon}
            </span>
            <span className="hidden md:inline font-headline">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

