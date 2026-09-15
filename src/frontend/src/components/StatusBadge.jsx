/**
 * StatusBadge — reusable pill badge for signal severity or gap status.
 *
 * variant: 'critical' | 'high' | 'medium' | 'low' | 'missing' | 'invalid' | 'present' | 'info'
 */
const VARIANT_STYLES = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  medium:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  low:      'bg-green-100 text-green-700 border-green-200',
  missing:  'bg-red-100 text-red-700 border-red-200',
  invalid:  'bg-orange-100 text-orange-700 border-orange-200',
  present:  'bg-green-100 text-green-700 border-green-200',
  info:     'bg-blue-100 text-blue-700 border-blue-200',
}

const DOT_STYLES = {
  critical: 'bg-red-500',
  high:     'bg-orange-500',
  medium:   'bg-yellow-500',
  low:      'bg-green-500',
  missing:  'bg-red-500',
  invalid:  'bg-orange-500',
  present:  'bg-green-500',
  info:     'bg-blue-500',
}

export default function StatusBadge({ variant = 'info', label, showDot = false }) {
  const style = VARIANT_STYLES[variant] ?? VARIANT_STYLES.info
  const dot   = DOT_STYLES[variant]    ?? DOT_STYLES.info

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />}
      {label}
    </span>
  )
}
