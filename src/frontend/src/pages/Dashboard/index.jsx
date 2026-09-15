/* ── DrugSafe AI — Safety Intelligence Dashboard ──
 * Matches: drugsafe_ai_safety_intelligence_dashboard/code.html
 */
export default function Dashboard({ onNavigate, onOpenChat }) {
  return (
    <div className="space-y-8">
      {/* PAGE HEADER & ACTION DECK */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight font-headline">
              Safety Intelligence Overview
            </h1>
            <span className="neu-raised-sm px-2.5 py-1 rounded-full text-[11px] font-mono bg-surface-container-high text-primary font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Live CIOMS / FAERS Stream
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1 font-sans">
            Monitor emerging drug safety signals and regulatory submission readiness in real time.
          </p>
        </div>
        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onNavigate && onNavigate('dossier')}
            className="neu-raised-card bg-surface hover:bg-surface-container text-on-surface text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg text-outline">picture_as_pdf</span>
            <span>Export PV Summary (PDF)</span>
          </button>
          <button
            onClick={() => onNavigate && onNavigate('signal')}
            className="neu-primary-extruded text-white text-sm font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">radar</span>
            <span>Run Signal Scan</span>
          </button>
        </div>
      </section>

      {/* 4 PRIMARY NEUMORPHIC METRIC CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          label="Active Safety Signals"
          icon="shield"
          iconBg="bg-surface text-primary"
          value="148"
          unit="tracked entities"
          badge={{ text: '+12% this cycle', color: 'bg-[#FEF3C7] text-[#92400E]', icon: 'trending_up' }}
          sub="vs prior 30-day window"
          progress={74}
          progressColor="bg-primary-container"
        />
        <MetricCard
          label="High Priority Signals"
          icon="warning"
          iconBg="bg-[#FDE8EC] text-error"
          value="9"
          valueColor="text-[#9F1239]"
          unit="critical flags"
          badge={{ text: 'Immediate QPPV Review', color: 'bg-[#FDE8EC] text-[#9F1239]', pulse: true }}
          progress={88}
          progressColor="bg-error"
        />
        <MetricCard
          label="Average PRR"
          icon="analytics"
          iconBg="bg-surface text-secondary"
          value="2.42x"
          unit="Proportional Reporting"
          badge={{ text: 'Benchmark > 2.0', color: 'bg-surface-container text-on-surface-variant' }}
          sub="Statistical threshold"
          progress={62}
          progressColor="bg-secondary"
        />
        <MetricCard
          label="CTD Readiness Score"
          icon="check_circle"
          iconBg="bg-[#D1FAE5] text-[#065F46]"
          value="82%"
          unit="Complete"
          unitColor="text-tertiary-container font-semibold"
          badge={{ text: 'ICH M4 Aligned', color: 'bg-[#D1FAE5] text-[#065F46]' }}
          sub="43 / 52 sections"
          progress={82}
          progressColor="bg-tertiary-container"
        />
      </section>

      {/* CENTER GRID: RECENT SAFETY SIGNALS TABLE & PRR TREND DATA VIZ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT/MAIN COLUMN (8 COLS): DATA TABLE */}
        <div className="lg:col-span-8 neu-raised-card bg-surface rounded-2xl p-6 flex flex-col justify-between">
          <div>
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-container">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-on-surface font-headline">Recent Safety Signals</h2>
                  <span className="neu-recessed-well px-2 py-0.5 rounded text-[11px] font-mono text-secondary font-medium">
                    Live openFDA / FAERS stream demo
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5 font-sans">
                  Multi-parameter automated disproportionality queries updated 14m ago.
                </p>
              </div>
              {/* Segmented Filter Pills */}
              <div className="neu-recessed-well p-1 rounded-lg flex items-center gap-1 bg-surface-container-low self-start sm:self-auto">
                <button className="neu-raised-sm px-3 py-1 rounded-md text-[11px] font-mono font-semibold text-primary bg-surface transition-all">
                  All (148)
                </button>
                <button className="px-3 py-1 rounded-md text-[11px] font-mono text-on-surface-variant hover:text-on-surface transition-all">
                  High Priority (9)
                </button>
                <button className="px-3 py-1 rounded-md text-[11px] font-mono text-on-surface-variant hover:text-on-surface transition-all">
                  Emerging (32)
                </button>
                <button className="px-3 py-1 rounded-md text-[11px] font-mono text-on-surface-variant hover:text-on-surface transition-all">
                  Monitoring (107)
                </button>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="neu-recessed-well text-on-surface-variant font-mono text-[11px] uppercase tracking-wider rounded-lg">
                    <th className="py-3 px-4 rounded-l-lg">Drug &amp; Substance</th>
                    <th className="py-3 px-3">Adverse Event (MedDRA PT)</th>
                    <th className="py-3 px-3 text-center">PRR Ratio</th>
                    <th className="py-3 px-3 text-right">Cases</th>
                    <th className="py-3 px-3 text-center">Severity</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right rounded-r-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-xs">
                  <SignalRow drug="Remdesivir" sub="GS-5734 • Antiviral" ae="Hepatic enzyme increased" pt="PT 10019641 (Hepatobiliary)" prr="3.84" cases="342" severity="Life-Threatening" severityColor="bg-[#FDE8EC] text-[#9F1239]" status="Emerging" statusColor="text-primary" />
                  <SignalRow drug="Pembrolizumab" sub="MK-3475 • Anti-PD-1 mAb" ae="Autoimmune colitis" pt="PT 10053424 (GI Disorders)" prr="4.15" cases="528" severity="Severe" severityColor="bg-[#FDE8EC] text-[#9F1239]" status="Confirmed" statusColor="text-[#9F1239]" statusBg="bg-[#FDE8EC]" />
                  <SignalRow drug="Semaglutide" sub="GLP-1 RA • Incretin mimetic" ae="Gastroparesis acute" pt="PT 10017832 (GI Motility)" prr="2.91" prrColor="text-[#D97706]" cases="819" severity="Moderate" severityColor="bg-[#FEF3C7] text-[#92400E]" status="Under Eval" statusColor="text-secondary" />
                  <SignalRow drug="Olaparib" sub="AZD-2281 • PARP Inhibitor" ae="Myelodysplastic syndrome" pt="PT 10028533 (Neoplasms)" prr="3.12" cases="114" severity="Life-Threatening" severityColor="bg-[#FDE8EC] text-[#9F1239]" status="Emerging" statusColor="text-primary" />
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer */}
          <div className="pt-4 mt-3 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-outline">
            <div className="flex items-center gap-2">
              <span>Showing 4 of 148 validated signals</span>
              <span>•</span>
              <span className="font-mono text-primary">Algorithm: EBGM + PRR</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="neu-raised-sm px-2.5 py-1 rounded text-xs text-on-surface bg-surface hover:bg-surface-container">Prev</button>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-surface-container rounded text-primary">1 / 37</span>
              <button className="neu-raised-sm px-2.5 py-1 rounded text-xs text-on-surface bg-surface hover:bg-surface-container">Next</button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 COLS): PRR TREND & SIGNAL CLUSTER CHART */}
        <div className="lg:col-span-4 neu-raised-card bg-surface rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-on-surface font-headline">PRR Trend &amp; Clusters</h2>
                <p className="text-xs text-on-surface-variant mt-0.5 font-sans">12-Month distribution across therapeutic classes</p>
              </div>
              <div className="neu-raised-sm p-1.5 rounded-lg bg-surface text-secondary">
                <span className="material-symbols-outlined text-lg">hub</span>
              </div>
            </div>

            {/* Signal Threshold Gauge */}
            <div className="mt-4 p-3 neu-recessed-well rounded-xl bg-surface-container-low">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-mono text-on-surface-variant font-medium">Disproportionality Cutoff (PRR)</span>
                <span className="font-mono text-primary font-bold">2.00x</span>
              </div>
              <div className="relative w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-primary-container rounded-full" style={{ width: '50%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-outline mt-1">
                <span>1.0 (Null)</span>
                <span className="text-error font-semibold">2.0 (Alert)</span>
                <span>5.0 (Critical)</span>
              </div>
            </div>

            {/* SVG Trend Visualization */}
            <div className="mt-5 relative w-full h-56 neu-recessed-well rounded-xl bg-surface-container-lowest p-3 flex flex-col justify-between">
              <div className="absolute inset-x-3 top-[42%] border-b border-dashed border-error/70 flex justify-end pr-1 z-10">
                <span className="font-mono text-[10px] text-error font-semibold -translate-y-3 bg-surface-container-lowest px-1">
                  Threshold (PRR ≥ 2.0)
                </span>
              </div>
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 320 180">
                <defs>
                  <linearGradient id="primaryGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGlow" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="50%" stopColor="#006398" />
                    <stop offset="100%" stopColor="#e11d48" />
                  </linearGradient>
                </defs>
                <line stroke="#eff4ff" strokeWidth="1" x1="0" x2="320" y1="36" y2="36" />
                <line stroke="#eff4ff" strokeWidth="1" x1="0" x2="320" y1="76" y2="76" />
                <line stroke="#eff4ff" strokeWidth="1" x1="0" x2="320" y1="116" y2="116" />
                <line stroke="#eff4ff" strokeWidth="1" x1="0" x2="320" y1="156" y2="156" />
                <path d="M0,130 C40,125 70,140 100,105 C140,65 180,95 220,70 C260,45 290,30 320,25 L320,180 L0,180 Z" fill="url(#primaryGradient)" />
                <path d="M0,130 C40,125 70,140 100,105 C140,65 180,95 220,70 C260,45 290,30 320,25" fill="none" stroke="url(#lineGlow)" strokeLinecap="round" strokeWidth="3" />
                <circle cx="100" cy="105" fill="#ffffff" r="4" stroke="#1d4ed8" strokeWidth="2.5" />
                <circle cx="220" cy="70" fill="#ffffff" r="4" stroke="#006398" strokeWidth="2.5" />
                <circle cx="320" cy="25" fill="#ffffff" r="5" stroke="#e11d48" strokeWidth="3" />
              </svg>
              <div className="flex justify-between text-[10px] font-mono text-outline pt-2 border-t border-surface-container">
                <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span>
                <span className="text-primary font-bold">Now</span>
              </div>
            </div>

            {/* Signal Clusters Breakdown */}
            <div className="mt-4 space-y-2">
              <ClusterRow color="bg-[#1d4ed8]" name="Oncology / Immuno-oncology" value="PRR 3.48 ± 0.6" />
              <ClusterRow color="bg-secondary" name="Metabolic & Endocrine" value="PRR 2.64 ± 0.3" />
              <ClusterRow color="bg-outline" name="Cardiovascular & Renal" value="PRR 1.82 ± 0.2" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
            <span className="font-mono text-[11px] text-outline">Confidence: 99% (p &lt; 0.001)</span>
            <a className="font-mono text-xs font-semibold text-primary hover:underline flex items-center gap-0.5" href="#">
              Open Cluster Map
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </a>
          </div>
        </div>
      </section>

      {/* REGULATORY READINESS SECTION: ICH CTD DOSSIER READINESS */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-on-surface font-headline">ICH CTD Dossier Readiness (M1 – M5)</h2>
              <span className="neu-raised-sm px-2.5 py-0.5 rounded text-xs font-mono bg-[#D1FAE5] text-[#065F46] font-semibold">
                eCTD 4.0 Standard
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-sans">
              Comprehensive submission integrity tracking across Common Technical Document modules for global filings.
            </p>
          </div>
          <button className="neu-raised-sm bg-surface hover:bg-surface-container text-primary text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
            <span className="material-symbols-outlined text-base">sync</span>
            <span>Validate Dossier Index</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <CTDModuleCard mod="M1" title="Administrative Info" desc="Application forms, cover letters, and labeling" pct={95} sections="19/20" status="Complete" statusColor="text-[#065F46]" barColor="bg-tertiary-container" />
          <CTDModuleCard mod="M2" title="CTD Summaries" desc="Nonclinical & clinical overviews, introductions" pct={88} sections="14/16" status="On Track" statusColor="text-[#065F46]" barColor="bg-primary-container" />
          <CTDModuleCard mod="M3" title="Quality / CMC" desc="Chemistry, Manufacturing & Controls" pct={74} sections="31/42" status="Action Req" statusColor="text-[#92400E]" barColor="bg-[#D97706]" />
          <CTDModuleCard mod="M4" title="Nonclinical" desc="Toxicology & Pharmacology Data" pct={90} sections="27/30" status="Ready" statusColor="text-[#065F46]" barColor="bg-tertiary-container" />
          <CTDModuleCard mod="M5" title="Clinical Reports" desc="Efficacy, Safety & Human Trial CSRs" pct={63} sections="25/40" status="Critical Gap" statusColor="text-[#9F1239]" barColor="bg-error" />
        </div>
      </section>
    </div>
  );
}

/* ── Sub-components ── */

function MetricCard({ label, icon, iconBg, value, valueColor, unit, unitColor, badge, sub, progress, progressColor }) {
  return (
    <div className="neu-raised-card bg-surface rounded-xl p-5 relative overflow-hidden transition-all hover:translate-y-[-2px]">
      <div className="flex justify-between items-start">
        <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider">{label}</span>
        <div className={`neu-raised-sm p-2 rounded-lg ${iconBg}`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className={`text-2xl font-extrabold font-headline ${valueColor || 'text-on-surface'}`}>{value}</span>
        <span className={`text-sm ${unitColor || 'text-outline'}`}>{unit}</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {badge && (
          <span className={`neu-raised-sm px-2 py-0.5 rounded-md font-mono text-[11px] ${badge.color} font-medium flex items-center gap-1`}>
            {badge.pulse && <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-ping"></span>}
            {badge.icon && <span className="material-symbols-outlined text-xs">{badge.icon}</span>}
            {badge.text}
          </span>
        )}
        {sub && <span className="text-xs text-outline font-sans">{sub}</span>}
      </div>
      <div className="neu-recessed-deep mt-4 h-1.5 w-full rounded-full overflow-hidden bg-surface-container">
        <div className={`${progressColor} h-full rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

function SignalRow({ drug, sub, ae, pt, prr, prrColor, cases, severity, severityColor, status, statusColor, statusBg }) {
  return (
    <tr className="hover:bg-surface-container/50 transition-colors group">
      <td className="py-3.5 px-4">
        <div className="font-semibold text-on-surface text-sm">{drug}</div>
        <div className="font-mono text-[11px] text-outline">{sub}</div>
      </td>
      <td className="py-3.5 px-3">
        <div className="font-medium text-on-surface">{ae}</div>
        <div className="font-mono text-[11px] text-outline">{pt}</div>
      </td>
      <td className="py-3.5 px-3 text-center">
        <span className={`neu-raised-sm px-2.5 py-1 rounded font-mono font-semibold ${prrColor || 'text-error'} bg-surface`}>
          {prr}
        </span>
      </td>
      <td className="py-3.5 px-3 text-right font-mono font-medium text-on-surface">{cases}</td>
      <td className="py-3.5 px-3 text-center">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${severityColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${severityColor.includes('#9F1239') ? 'bg-[#E11D48]' : 'bg-[#D97706]'}`}></span>
          {severity}
        </span>
      </td>
      <td className="py-3.5 px-3 text-center">
        <span className={`neu-raised-sm px-2 py-0.5 rounded text-xs font-medium bg-surface ${statusColor} ${statusBg || ''}`}>
          {status}
        </span>
      </td>
      <td className="py-3.5 px-4 text-right">
        <button className="neu-raised-sm px-3 py-1.5 rounded-md text-xs font-semibold text-primary bg-surface hover:bg-surface-container transition-all active:scale-[0.98]">
          Review Signal
        </button>
      </td>
    </tr>
  );
}

function ClusterRow({ color, name, value }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-2 font-medium text-on-surface">
        <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
        {name}
      </span>
      <span className="font-mono font-semibold text-on-surface">{value}</span>
    </div>
  );
}

function CTDModuleCard({ mod, title, desc, pct, sections, status, statusColor, barColor }) {
  return (
    <div className="neu-raised-card bg-surface rounded-xl p-4 flex flex-col justify-between hover:translate-y-[-2px] transition-all">
      <div>
        <div className="flex items-center justify-between">
          <span className="neu-recessed-well px-2 py-0.5 rounded text-xs font-mono font-bold text-primary">{mod}</span>
          <span className={`inline-flex items-center gap-1 text-[11px] font-mono ${statusColor} font-semibold`}>
            <span className={`w-1.5 h-1.5 rounded-full ${pct >= 85 ? 'bg-[#059669]' : pct >= 70 ? 'bg-[#D97706]' : 'bg-[#E11D48]'}`}></span>
            {status}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-on-surface mt-2 leading-snug font-headline">{title}</h3>
        <p className="text-xs text-outline mt-1 font-sans">{desc}</p>
      </div>
      <div className="mt-4">
        <div className="flex justify-between items-baseline text-xs mb-1.5">
          <span className="font-mono font-bold text-on-surface">{pct}%</span>
          <span className="font-mono text-outline">{sections} Sections</span>
        </div>
        <div className="neu-recessed-well h-2 w-full rounded-full overflow-hidden bg-surface-container">
          <div className={`${barColor} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('dossier'); }}
          className="mt-3 text-xs font-mono text-primary font-medium hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
        >
          Inspect Module <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
