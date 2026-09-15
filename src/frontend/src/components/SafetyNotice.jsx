/* ── DrugSafe AI — Safety Guardrail Notice ──
 * Regulatory and Decision-Support Disclaimer
 */
export default function SafetyNotice({ className = '' }) {
  return (
    <div
      role="note"
      aria-label="Regulatory and Clinical Decision Support Guardrail"
      className={`rounded-xl neu-well-inset bg-[#eff4ff] border border-[#c4c5d7]/40 px-4 py-2.5 flex items-start sm:items-center gap-3 text-[#434655] ${className}`}
    >
      <div className="w-6 h-6 rounded-lg neu-surface-level-1 bg-[#f8f9ff] flex items-center justify-center shrink-0 text-[#0037b0] mt-0.5 sm:mt-0">
        <span className="material-symbols-outlined text-[16px]">verified_user</span>
      </div>
      <p className="font-mono text-[11px] leading-relaxed text-[#434655]">
        <strong className="text-[#0b1c30] font-semibold">Decision-support only.</strong>{' '}
        Statistical signals do not establish causality. AI-generated analysis requires qualified human review. Submission readiness is an internal assessment and does not represent regulatory approval probability.
      </p>
    </div>
  );
}
