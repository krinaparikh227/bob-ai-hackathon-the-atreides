/**
 * ModuleScore — displays the completeness score for a single CTD module (M1–M5).
 */

const MODULE_META = {
  1: { name: 'Administrative Information',        short: 'M1', icon: 'folder_managed', desc: 'Regional administrative documents and forms' },
  2: { name: 'Common Technical Document Summaries', short: 'M2', icon: 'summarize',     desc: 'Overviews and summaries of quality, safety, and efficacy' },
  3: { name: 'Quality',                           short: 'M3', icon: 'biotech',       desc: 'Drug substance and drug product manufacturing' },
  4: { name: 'Nonclinical Study Reports',         short: 'M4', icon: 'science',       desc: 'Pharmacology, pharmacokinetics, and toxicology' },
  5: { name: 'Clinical Study Reports',            short: 'M5', icon: 'clinical_notes', desc: 'Clinical pharmacology and biopharmaceutics studies' },
}

export default function ModuleScore({ moduleNumber, score = 0, gapCount = 0 }) {
  const meta = MODULE_META[moduleNumber] ?? { name: `Module ${moduleNumber}`, short: `M${moduleNumber}`, icon: 'folder', desc: '' }
  const pct  = Math.max(0, Math.min(100, Math.round(score)))

  const statusColor = pct >= 90 ? 'text-tertiary' : pct >= 70 ? 'text-primary' : 'text-error'
  const barColor = pct >= 90 ? 'bg-tertiary' : pct >= 70 ? 'bg-primary' : 'bg-error'

  return (
    <div className="neu-raised-card p-5 rounded-2xl bg-surface border border-white/60 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-primary flex-shrink-0">
            <span className="material-symbols-outlined text-xl">{meta.icon}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-surface-container-high">
                {meta.short}
              </span>
              <p className="text-sm font-bold font-headline text-on-surface truncate">{meta.name}</p>
            </div>
            <p className="text-xs text-on-surface-variant truncate mt-0.5">{meta.desc}</p>
          </div>
        </div>
        <span className={`text-xl font-bold font-headline ${statusColor}`}>
          {pct}%
        </span>
      </div>

      {/* Recessed Progress Bar */}
      <div className="neu-inset h-3 rounded-full bg-surface-container-low p-0.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Footer Gaps text */}
      <div className="flex items-center justify-between text-xs pt-1 font-mono">
        <span className="text-outline">Status:</span>
        {gapCount > 0 ? (
          <span className="text-error font-bold">{gapCount} Gap{gapCount !== 1 ? 's' : ''} Found</span>
        ) : (
          <span className="text-tertiary font-bold">ICH Compliant</span>
        )}
      </div>
    </div>
  )
}

