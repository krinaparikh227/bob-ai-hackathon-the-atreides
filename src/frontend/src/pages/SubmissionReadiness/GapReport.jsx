import StatusBadge from '../../components/StatusBadge.jsx'

/**
 * GapReport — renders the list of CTD structure gaps returned by the backend.
 * @param {{ gaps: Array }} props
 * gaps shape: { module, section_id, section_name, status: 'missing'|'invalid' }
 */
export default function GapReport({ gaps = [] }) {
  if (gaps.length === 0) return null

  const missing = gaps.filter(g => g.status === 'missing').length
  const invalid = gaps.filter(g => g.status === 'invalid').length

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-900">Gap Report</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sections that must be addressed before submission
          </p>
        </div>
        <div className="flex items-center gap-2">
          {missing > 0 && (
            <StatusBadge variant="missing" label={`${missing} missing`} showDot />
          )}
          {invalid > 0 && (
            <StatusBadge variant="invalid" label={`${invalid} invalid`} showDot />
          )}
        </div>
      </div>

      {/* Gap rows */}
      <ul className="divide-y divide-slate-100">
        {gaps.map((gap, idx) => (
          <li key={gap.section_id ?? idx} className="flex items-start gap-4 px-5 py-3">
            {/* Module pill */}
            <span className="flex-shrink-0 mt-0.5 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5 min-w-[32px] text-center">
              M{gap.module ?? '?'}
            </span>

            {/* Section info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">
                {gap.section_name ?? gap.section_id ?? `Section ${idx + 1}`}
              </p>
              {gap.section_id && gap.section_name && (
                <p className="text-xs text-slate-400 font-mono mt-0.5">{gap.section_id}</p>
              )}
            </div>

            {/* Status badge */}
            <div className="flex-shrink-0 mt-0.5">
              <StatusBadge
                variant={gap.status === 'missing' ? 'missing' : 'invalid'}
                label={gap.status === 'missing' ? 'Missing' : 'Invalid'}
                showDot
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
