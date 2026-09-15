import StatusBadge from '../../components/StatusBadge.jsx'

/**
 * Maps a numeric PRR score to a severity variant for StatusBadge.
 * PRR >= 10 → critical, >= 5 → high, >= 2 → medium, else → low
 */
export function prrToSeverity(prr) {
  if (prr == null) return 'info'
  if (prr >= 10) return 'critical'
  if (prr >= 5)  return 'high'
  if (prr >= 2)  return 'medium'
  return 'low'
}

const SEVERITY_LABEL = {
  critical: 'Critical',
  high:     'High',
  medium:   'Medium',
  low:      'Low',
  info:     'Unknown',
}

export default function SignalTable({ signals = [], onSelect, selectedId }) {
  if (signals.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-xl neu-raised-card bg-surface p-1 border border-white/60">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="neu-recessed-well rounded-lg text-xs font-mono text-outline uppercase tracking-wider">
            <th className="text-left px-4 py-3 font-semibold rounded-l-lg">Target Drug</th>
            <th className="text-left px-4 py-3 font-semibold">Adverse Event (MedDRA PT)</th>
            <th className="text-right px-4 py-3 font-semibold">PRR Score</th>
            <th className="text-right px-4 py-3 font-semibold">Case Count (N)</th>
            <th className="text-center px-4 py-3 font-semibold">Severity Triage</th>
            <th className="text-center px-4 py-3 font-semibold rounded-r-lg">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container-high/60">
          {signals.map((signal, idx) => {
            const id = signal.id ?? `${signal.drug_name}-${signal.event_term}-${idx}`
            const severity = signal.severity ?? prrToSeverity(signal.prr_score)
            const isSelected = selectedId === id

            return (
              <tr
                key={id}
                onClick={() => onSelect?.(isSelected ? null : { ...signal, id })}
                className={`cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'neu-table-selected bg-surface-container-low font-semibold'
                    : 'hover:bg-surface-container-low/70'
                }`}
              >
                <td className="px-4 py-3.5 font-medium text-on-surface">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">medication</span>
                    <span>{signal.drug_name ?? '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-on-surface-variant font-headline">
                  {signal.event_term ?? '—'}
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-on-surface">
                  <span className={`px-2 py-0.5 rounded neu-inset text-xs ${severity === 'critical' ? 'text-error font-bold' : 'text-primary'}`}>
                    {signal.prr_score != null ? Number(signal.prr_score).toFixed(2) : '—'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-on-surface-variant">
                  {signal.case_count != null ? Number(signal.case_count).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <StatusBadge
                    variant={severity}
                    label={SEVERITY_LABEL[severity] ?? severity}
                    showDot
                  />
                </td>
                <td className="px-4 py-3.5 text-center">
                  <button className="p-1 rounded neu-raised-sm hover:bg-surface-container text-outline hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">visibility</span>
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

