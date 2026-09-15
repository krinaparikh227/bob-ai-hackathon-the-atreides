import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts'

/** PRR threshold reference lines (industry standard) */
const THRESHOLDS = [
  { value: 2,  label: 'PRR≥2', color: '#f59e0b' },
  { value: 5,  label: 'PRR≥5', color: '#ef4444' },
]

function barColor(prr) {
  if (prr >= 10) return '#dc2626'
  if (prr >= 5)  return '#ea580c'
  if (prr >= 2)  return '#ca8a04'
  return '#16a34a'
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-slate-900">{d.label}</p>
      <p className="text-slate-600">PRR: <span className="font-mono font-bold text-slate-900">{Number(d.prr_score).toFixed(2)}</span></p>
      {d.case_count != null && (
        <p className="text-slate-500 text-xs">Cases: {Number(d.case_count).toLocaleString()}</p>
      )}
    </div>
  )
}

/**
 * PRRChart — Recharts bar chart visualising PRR scores across drug-event pairs.
 * @param {{ signals: Array }} props
 */
export default function PRRChart({ signals = [] }) {
  if (signals.length === 0) return null

  const data = signals
    .filter(s => s.prr_score != null)
    .map((s, i) => ({
      ...s,
      label: s.event_term
        ? `${s.drug_name ?? 'Drug'} / ${s.event_term}`
        : (s.drug_name ?? `Signal ${i + 1}`),
    }))
    .sort((a, b) => b.prr_score - a.prr_score)
    .slice(0, 20) // cap at 20 bars to keep the chart readable

  if (data.length === 0) return null

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">PRR Scores</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Proportional Reporting Ratio — higher values indicate stronger safety signals
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {THRESHOLDS.map(t => (
            <span key={t.value} className="flex items-center gap-1">
              <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: t.color }} />
              {t.label}
            </span>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={data.length > 8 ? 360 : 240}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis
            type="number"
            domain={[0, 'auto']}
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={160}
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          {THRESHOLDS.map(t => (
            <ReferenceLine key={t.value} x={t.value} stroke={t.color} strokeDasharray="4 2" />
          ))}
          <Bar dataKey="prr_score" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {data.map((entry, index) => (
              <Cell key={index} fill={barColor(entry.prr_score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
