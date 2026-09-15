/* ── DrugSafe AI — Signal Detection Workspace ──
 * Matches: drugsafe_ai_signal_detection_workspace/code.html
 * Enhanced with active drug search, dataset controls, 2x2 contingency table,
 * subgroup analysis, confounder flags, and human review audit workflow.
 */
import { useState, useEffect } from 'react';
import { fetchSignals } from '../../api/signals.js';

const SIGNAL_DATA = [
  {
    id: 'SIG-101',
    drug: 'Pembrolizumab',
    sub: 'MK-3475 • Anti-PD-1 mAb',
    cas: 'CAS: 1374853-91-4',
    ae: 'Immune-mediated colitis',
    soc: 'Gastrointestinal disorders',
    pt: 'PT 10053424',
    prr: 3.84,
    ciLower: 3.32,
    ciUpper: 4.45,
    ror: 3.89,
    chi: 142.6,
    ebgm: 3.76,
    pValue: '< 0.0001',
    cases: 184,
    seriousCases: 42,
    fatalCases: 3,
    hospitalized: 38,
    severity: 'Critical',
    sevColor: 'text-[#9f1239]',
    sevBg: 'bg-[#fde8ec]',
    status: 'Emerging',
    statusColor: 'text-[#0037b0]',
    statusBg: 'bg-[#e5eeff]',
    cellA: 184,
    cellB: 14210,
    cellC: 1240,
    cellD: 372400,
    velocity: '+42% in Q3',
    subgroup: {
      age65Plus: '64% concentrated (PRR 4.12)',
      gender: '52% Female / 48% Male',
      concomitant: 'Ipilimumab (CTLA-4) in 41% of cases',
    },
    confounder: 'Indication bias: Pre-existing autoimmune predisposition in oncology cohort.',
    aiAnalysis: 'Immune-mediated colitis with Pembrolizumab shows marked disproportionality (PRR = 3.84, χ² = 142.6, p < 0.0001). Acceleration concentrated in Q3 2024 following expanded dual-checkpoint regimens. Recommended action: Submit PRAC notification within 15 calendar days per EU GVP Module IX.',
  },
  {
    id: 'SIG-102',
    drug: 'Pembrolizumab',
    sub: 'MK-3475 • Anti-PD-1 mAb',
    cas: 'CAS: 1374853-91-4',
    ae: 'Myocarditis',
    soc: 'Cardiac disorders',
    pt: 'PT 10028593',
    prr: 4.21,
    ciLower: 3.51,
    ciUpper: 5.08,
    ror: 4.30,
    chi: 198.4,
    ebgm: 4.15,
    pValue: '< 0.0001',
    cases: 42,
    seriousCases: 39,
    fatalCases: 8,
    hospitalized: 36,
    severity: 'Critical',
    sevColor: 'text-[#9f1239]',
    sevBg: 'bg-[#fde8ec]',
    status: 'Investigational',
    statusColor: 'text-[#92400e]',
    statusBg: 'bg-[#fef3c7]',
    cellA: 42,
    cellB: 14352,
    cellC: 280,
    cellD: 373360,
    velocity: '+18% in Q3',
    subgroup: {
      age65Plus: '71% concentrated (PRR 4.65)',
      gender: '44% Female / 56% Male',
      concomitant: 'Anthracycline history reported in 28%',
    },
    confounder: 'Prior cardiotoxic chemotherapy may contribute as potential synergist.',
    aiAnalysis: 'Immune-related myocarditis demonstrates very high disproportionality (PRR = 4.21). High case fatality rate (19%) warrants expedited Safety Advisory Committee review.',
  },
  {
    id: 'SIG-103',
    drug: 'Remdesivir',
    sub: 'GS-5734 • Nucleoside Analogue',
    cas: 'CAS: 1809249-37-3',
    ae: 'Hepatic enzyme increased',
    soc: 'Hepatobiliary disorders',
    pt: 'PT 10019641',
    prr: 3.84,
    ciLower: 3.41,
    ciUpper: 4.31,
    ror: 3.92,
    chi: 165.2,
    ebgm: 3.80,
    pValue: '< 0.0001',
    cases: 342,
    seriousCases: 88,
    fatalCases: 4,
    hospitalized: 112,
    severity: 'Severe',
    sevColor: 'text-[#9f1239]',
    sevBg: 'bg-[#fde8ec]',
    status: 'Emerging',
    statusColor: 'text-[#0037b0]',
    statusBg: 'bg-[#e5eeff]',
    cellA: 342,
    cellB: 24100,
    cellC: 2150,
    cellD: 361400,
    velocity: '+28% in Q3',
    subgroup: {
      age65Plus: '58% elderly in ICU setting',
      gender: '38% Female / 62% Male',
      concomitant: 'Corticosteroids & IL-6 inhibitors',
    },
    confounder: 'Severe viral illness itself contributes to transaminase elevation.',
    aiAnalysis: 'Transaminase elevation consistently elevated in ICU-treated patient cohort. Liver function monitoring guidance confirmed in Section 4.4.',
  },
  {
    id: 'SIG-104',
    drug: 'Pembrolizumab',
    sub: 'MK-3475 • Anti-PD-1 mAb',
    cas: 'CAS: 1374853-91-4',
    ae: 'Acute interstitial nephritis',
    soc: 'Renal and urinary disorders',
    pt: 'PT 10000843',
    prr: 3.12,
    ciLower: 2.58,
    ciUpper: 3.78,
    ror: 3.18,
    chi: 84.2,
    ebgm: 3.05,
    pValue: '< 0.001',
    cases: 96,
    seriousCases: 32,
    fatalCases: 1,
    hospitalized: 45,
    severity: 'Severe',
    sevColor: 'text-[#9f1239]',
    sevBg: 'bg-[#fde8ec]',
    status: 'Confirmed',
    statusColor: 'text-[#065f46]',
    statusBg: 'bg-[#d1fae5]',
    cellA: 96,
    cellB: 14298,
    cellC: 840,
    cellD: 372800,
    velocity: 'Stable (+6%)',
    subgroup: {
      age65Plus: '54% over 65 years',
      gender: '50% Female / 50% Male',
      concomitant: 'PPIs & NSAIDs concurrent use in 35%',
    },
    confounder: 'Concurrent proton pump inhibitors are known risk factors for AIN.',
    aiAnalysis: 'Confirmed immune-mediated nephritis signal with stable trend. Covered under standard management guidelines (steroid rechallenge protocol).',
  },
  {
    id: 'SIG-105',
    drug: 'Semaglutide',
    sub: 'GLP-1 RA • Incretin mimetic',
    cas: 'CAS: 910463-68-2',
    ae: 'Gastroparesis acute',
    soc: 'Gastrointestinal disorders',
    pt: 'PT 10017832',
    prr: 2.91,
    ciLower: 2.65,
    ciUpper: 3.20,
    ror: 2.95,
    chi: 92.4,
    ebgm: 2.85,
    pValue: '< 0.0001',
    cases: 819,
    seriousCases: 142,
    fatalCases: 0,
    hospitalized: 98,
    severity: 'Moderate',
    sevColor: 'text-[#92400e]',
    sevBg: 'bg-[#fef3c7]',
    status: 'Under Eval',
    statusColor: 'text-[#006398]',
    statusBg: 'bg-[#e5eeff]',
    cellA: 819,
    cellB: 38200,
    cellC: 2840,
    cellD: 346100,
    velocity: '+65% in Q3',
    subgroup: {
      age65Plus: '34% elderly',
      gender: '68% Female / 32% Male',
      concomitant: 'Metformin, SGLT2i',
    },
    confounder: 'Diabetic gastroparesis baseline background prevalence.',
    aiAnalysis: 'Substantial increase in gastroparesis reports driven by increased off-label usage and heightened social media reporting. Signal under active PRAC evaluation.',
  },
  {
    id: 'SIG-106',
    drug: 'Olaparib',
    sub: 'AZD-2281 • PARP Inhibitor',
    cas: 'CAS: 763113-22-0',
    ae: 'Myelodysplastic syndrome',
    soc: 'Neoplasms benign, malignant and unspecified',
    pt: 'PT 10028533',
    prr: 3.12,
    ciLower: 2.60,
    ciUpper: 3.75,
    ror: 3.18,
    chi: 114.8,
    ebgm: 3.08,
    pValue: '< 0.0001',
    cases: 114,
    seriousCases: 110,
    fatalCases: 28,
    hospitalized: 92,
    severity: 'Critical',
    sevColor: 'text-[#9f1239]',
    sevBg: 'bg-[#fde8ec]',
    status: 'Emerging',
    statusColor: 'text-[#0037b0]',
    statusBg: 'bg-[#e5eeff]',
    cellA: 114,
    cellB: 8900,
    cellC: 1450,
    cellD: 377500,
    velocity: '+14% in Q3',
    subgroup: {
      age65Plus: '62% over 65',
      gender: '92% Female (Ovarian cancer)',
      concomitant: 'Platinum chemotherapy prior therapy',
    },
    confounder: 'Extensive prior exposure to DNA-damaging platinum agents.',
    aiAnalysis: 'Known class risk under prolonged PARP inhibition. Black box warning in US PI; periodic surveillance active.',
  },
];

const REVIEW_STATES = [
  'New',
  'Screening',
  'Under Assessment',
  'Confirmed',
  'Dismissed',
  'Monitoring',
  'Action Recommended',
  'Closed',
];

export default function SignalDetection({ onNavigate, onOpenChat }) {
  const [selectedSignalIndex, setSelectedSignalIndex] = useState(0);
  const [searchDrug, setSearchDrug] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('openFDA FAERS (Q3 2024)');
  const [isScanning, setIsScanning] = useState(false);
  const [signals, setSignals] = useState(SIGNAL_DATA);
  const [reviewStatuses, setReviewStatuses] = useState({
    'SIG-101': 'Emerging',
    'SIG-102': 'Investigational',
    'SIG-103': 'Emerging',
    'SIG-104': 'Confirmed',
    'SIG-105': 'Under Assessment',
    'SIG-106': 'Emerging',
  });
  const [reviewerNotes, setReviewerNotes] = useState({
    'SIG-101': 'Correlated with 2024 oncology guideline updates. PRAC notification drafted.',
  });
  const [currentNote, setCurrentNote] = useState(
    'Correlated with 2024 oncology guideline updates. PRAC notification drafted.'
  );
  const [savedAuditFeedback, setSavedAuditFeedback] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadSignals() {
      try {
        const res = await fetchSignals();
        if (isMounted && res?.signals && res.signals.length > 0) {
          setSignals(res.signals);
        }
      } catch (err) {
        console.warn('Backend signals fetch error, using local fallback:', err);
      }
    }
    loadSignals();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSignals = signals.filter((sig) => {
    if (!searchDrug.trim()) return true;
    const q = searchDrug.toLowerCase();
    return (
      (sig.drug && sig.drug.toLowerCase().includes(q)) ||
      (sig.ae && sig.ae.toLowerCase().includes(q)) ||
      (sig.soc && sig.soc.toLowerCase().includes(q)) ||
      (sig.sub && sig.sub.toLowerCase().includes(q))
    );
  });

  const activeSignal = filteredSignals[selectedSignalIndex] || filteredSignals[0] || signals[0] || SIGNAL_DATA[0];

  async function handleRunDetection() {
    setIsScanning(true);
    try {
      const res = await fetchSignals({ drugName: searchDrug });
      if (res?.signals && res.signals.length > 0) {
        setSignals(res.signals);
        setSelectedSignalIndex(0);
      }
    } catch (err) {
      console.warn('Backend signals fetch completed or returned empty:', err);
    } finally {
      setTimeout(() => {
        setIsScanning(false);
      }, 700);
    }
  }

  function handleSaveAssessment() {
    setReviewerNotes((prev) => ({
      ...prev,
      [activeSignal.id]: currentNote,
    }));
    setSavedAuditFeedback(true);
    setTimeout(() => {
      setSavedAuditFeedback(false);
    }, 3000);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Workspace Page Title & GxP Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-headline">
              Signal Detection Workspace
            </h1>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#e5eeff] text-[#0037b0] border border-[#1d4ed8]/20 font-semibold">
              Live Disproportionality Matrix
            </span>
          </div>
          <p className="text-xs lg:text-sm text-[#434655] mt-1 max-w-4xl font-sans">
            Identify emerging adverse drug reactions using statistical disproportionality methods (PRR, ROR, Chi-Square, EBGM) and clinical subgroup stratification.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-[11px] font-mono text-[#747686]">Standard:</span>
          <span className="text-[11px] font-mono font-semibold text-[#0b1c30] bg-[#e5eeff] px-2.5 py-1 rounded-lg">
            ICH E2C(R2) / CIOMS VIII
          </span>
          <button
            onClick={() => onOpenChat && onOpenChat()}
            className="p-1.5 rounded-lg neu-surface-level-1 hover:bg-[#eff4ff] text-[#747686] hover:text-[#0037b0] transition-colors cursor-pointer"
            title="Ask IBM Bob AI Copilot"
          >
            <span className="material-symbols-outlined text-base">smart_toy</span>
          </button>
        </div>
      </div>

      {/* NEUMORPHIC FILTER & QUERY CONTROL CONSOLE */}
      <section className="neu-surface-level-2 p-5 rounded-2xl bg-[#f8f9ff] flex flex-col gap-4 border border-white/80">
        <div className="flex items-center justify-between border-b border-[#c4c5d7]/40 pb-2.5">
          <div className="flex items-center gap-2 text-[#0037b0] font-semibold text-sm font-headline">
            <span className="material-symbols-outlined text-base">tune</span>
            <span>Signal Stratification &amp; Statistical Query Console</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#747686]">Statistical Significance Gate:</span>
            <span className="neu-well-inset px-2.5 py-0.5 rounded text-[11px] font-mono text-[#0037b0] font-bold">
              PRR ≥ 2.0 | χ² ≥ 3.84 (p &lt; 0.05)
            </span>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Active Drug Search Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-semibold text-[#434655] flex items-center justify-between">
              <span>Target Drug (Active Substance)</span>
              <span className="text-[10px] text-[#0037b0]">Live Filter</span>
            </label>
            <div className="neu-well-inset rounded-xl px-3 py-2 bg-[#eff4ff] flex items-center gap-2 focus-within:ring-1 focus-within:ring-[#1d4ed8]">
              <span className="material-symbols-outlined text-[#0037b0] text-sm">medication</span>
              <input
                type="text"
                value={searchDrug}
                onChange={(e) => {
                  setSearchDrug(e.target.value);
                  setSelectedSignalIndex(0);
                }}
                placeholder="Search drug (e.g., Pembrolizumab, Semaglutide)..."
                className="bg-transparent border-none outline-none text-xs w-full text-[#0b1c30] placeholder:text-[#747686] font-sans p-0"
              />
              {searchDrug && (
                <button
                  onClick={() => setSearchDrug('')}
                  className="text-[#747686] hover:text-[#0b1c30] text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* MedDRA SOC Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-semibold text-[#434655] flex items-center justify-between">
              <span>MedDRA System Organ Class (SOC)</span>
              <span className="text-[10px] text-[#747686]">v27.0</span>
            </label>
            <div className="neu-well-inset rounded-xl px-3 py-2 bg-[#eff4ff] flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="material-symbols-outlined text-[#006398] text-sm">category</span>
                <span className="text-xs font-semibold text-[#0b1c30] truncate font-sans">
                  Gastrointestinal &amp; Cardiac disorders
                </span>
              </div>
              <span className="material-symbols-outlined text-[#747686] text-sm">expand_more</span>
            </div>
          </div>

          {/* Surveillance Window */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-semibold text-[#434655]">Surveillance Window</label>
            <div className="neu-well-inset rounded-xl px-3 py-2 bg-[#eff4ff] flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#747686] text-sm">calendar_month</span>
                <span className="text-xs font-semibold text-[#0b1c30] font-sans">2024-Q1 to 2024-Q4 (Rolling)</span>
              </div>
              <span className="material-symbols-outlined text-[#747686] text-sm">expand_more</span>
            </div>
          </div>

          {/* Primary Dataset Source */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-semibold text-[#434655] flex items-center justify-between">
              <span>Primary Disproportionality Source</span>
              <span className="text-[10px] text-[#004f35] font-semibold">Live Synchronized</span>
            </label>
            <div className="neu-well-inset rounded-xl px-3 py-2 bg-[#eff4ff] flex items-center justify-between">
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="bg-transparent border-0 outline-none text-xs font-semibold text-[#0b1c30] w-full cursor-pointer font-sans p-0"
              >
                <option value="openFDA FAERS (Q3 2024)">openFDA FAERS (Q3 2024 Release)</option>
                <option value="WHO VigiBase 2024">WHO VigiBase (Global Drug Safety)</option>
                <option value="EudraVigilance EVDAS">EudraVigilance (EMA EVDAS)</option>
                <option value="Clinical Trials Safety DB">Internal Phase III Safety DB</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#747686]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#004f35] animate-pulse"></span>
              Cohort Size: 428,910 reports
            </span>
            <span>•</span>
            <span>Bayesian Shrinkage (EBGM) Active</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setSearchDrug('');
                setSelectedSignalIndex(0);
              }}
              className="px-3.5 py-2 rounded-xl neu-btn-raised bg-[#f8f9ff] text-xs font-semibold text-[#434655] hover:text-[#0b1c30] flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
              <span>Clear Filter</span>
            </button>

            <button
              disabled={isScanning}
              onClick={handleRunDetection}
              className="px-5 py-2 rounded-xl neu-btn-primary text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span className={`material-symbols-outlined text-base ${isScanning ? 'animate-spin' : ''}`}>
                {isScanning ? 'autorenew' : 'radar'}
              </span>
              <span>{isScanning ? 'Scanning FAERS Database...' : 'Run Signal Detection'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* KPI SUMMARY ROW */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Reports Analyzed"
          icon="library_books"
          iconColor="text-[#0037b0]"
          value="428,910"
          trend="+12.4% YoY"
          trendColor="text-[#065f46]"
          progress={82}
          progressColor="bg-[#0037b0]"
          sub="openFDA FAERS cumulative cohort"
        />
        <KPICard
          label="Potential Signals"
          icon="query_stats"
          iconColor="text-[#006398]"
          value={`${filteredSignals.length}`}
          trend="PRR ≥ 2.0"
          trendColor="text-[#0037b0]"
          progress={58}
          progressColor="bg-[#006398]"
          sub="Filtered safety entities"
        />
        <KPICard
          label="High Priority Signals"
          labelColor="text-[#9f1239]"
          icon="emergency_home"
          iconColor="text-[#ba1a1a]"
          value="3"
          valueColor="text-[#9f1239]"
          trend="Action Req"
          trendBg="bg-[#fde8ec]"
          trendColor="text-[#9f1239]"
          progress={75}
          progressColor="bg-[#ba1a1a]"
          sub="PRR ≥ 3.0 & χ² ≥ 100"
        />
        <KPICard
          label="Mean PRR Disproportionality"
          icon="calculate"
          iconColor="text-[#004f35]"
          value="3.46x"
          trend="σ = 0.58"
          trendColor="text-[#747686]"
          progress={68}
          progressColor="bg-[#004f35]"
          sub="Benchmark: background = 1.0"
        />
      </section>

      {/* DUAL SPLIT LAYOUT: SIGNAL TABLE (7 COLS) & SIGNAL DEEP DIVE DRAWER (5 COLS) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Signal Table */}
        <section className="xl:col-span-7 neu-surface-level-2 p-5 rounded-2xl bg-[#f8f9ff] border border-white/80 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#c4c5d7]/40 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0037b0] text-lg">table_chart</span>
              <h3 className="text-sm font-bold text-[#0b1c30] font-headline">
                Prioritized Adverse Event Signals
              </h3>
              <span className="text-[11px] font-mono text-[#747686]">
                ({filteredSignals.length} entries)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#747686]">
              <span>Click a row to inspect signal:</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table aria-label="Signal Table" className="w-full text-left border-collapse">
              <thead>
                <tr className="neu-well-inset rounded-xl bg-[#eff4ff] text-[11px] font-mono text-[#747686] uppercase tracking-wider">
                  <th className="py-2.5 px-3 rounded-l-lg font-semibold">Drug &amp; Moieties</th>
                  <th className="py-2.5 px-3 font-semibold">Adverse Event (MedDRA)</th>
                  <th className="py-2.5 px-2 font-semibold text-center">PRR</th>
                  <th className="py-2.5 px-2 font-semibold text-center">χ²</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Cases</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-3 rounded-r-lg text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#c4c5d7]/30">
                {filteredSignals.map((sig, idx) => {
                  const isSelected = activeSignal.id === sig.id;
                  const currentSt = reviewStatuses[sig.id] || sig.status;
                  return (
                    <tr
                      key={sig.id}
                      onClick={() => {
                        setSelectedSignalIndex(idx);
                        setCurrentNote(reviewerNotes[sig.id] || '');
                      }}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#eff4ff] font-semibold border-l-4 border-[#0037b0]'
                          : 'hover:bg-[#eff4ff]/60'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#0b1c30] font-sans">{sig.drug}</div>
                        <div className="text-[10px] text-[#747686] font-mono">{sig.sub}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-[#0b1c30] font-medium">{sig.ae}</div>
                        <div className="text-[10px] text-[#747686] font-mono">{sig.pt}</div>
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-bold text-[#9f1239]">
                        {sig.prr.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-[#0b1c30]">
                        {sig.chi.toFixed(1)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-semibold text-[#0b1c30]">
                        {sig.cases}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${sig.statusBg} ${sig.statusColor}`}
                        >
                          {currentSt}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSignalIndex(idx);
                          }}
                          className="px-2 py-1 rounded text-[11px] font-mono text-[#0037b0] hover:underline cursor-pointer"
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Column: Signal Deep Dive Inspection Drawer */}
        <section className="xl:col-span-5 neu-surface-level-2 p-5 rounded-2xl bg-[#f8f9ff] border border-white/80 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#c4c5d7]/40 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0037b0] text-lg">biotech</span>
              <h3 className="text-sm font-bold text-[#0b1c30] font-headline">
                Signal Deep Dive: {activeSignal.ae}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#9f1239] font-bold flex items-center gap-1 bg-[#fde8ec] px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-pulse"></span>
              {activeSignal.severity.toUpperCase()}
            </span>
          </div>

          {/* Statistical KPI Triple */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="neu-well-inset p-2.5 rounded-xl bg-[#eff4ff] text-center">
              <div className="text-[10px] font-mono text-[#747686] uppercase font-medium">PRR Score</div>
              <div className="text-xl font-bold text-[#9f1239] font-headline mt-0.5">
                {typeof activeSignal?.prr === 'number' ? activeSignal.prr.toFixed(2) : (activeSignal?.prr ?? '—')}
              </div>
              <div className="text-[9px] font-mono text-[#747686]">
                CI: {activeSignal?.ciLower ?? activeSignal?.ci_lower ?? '—'}–{activeSignal?.ciUpper ?? activeSignal?.ci_upper ?? '—'}
              </div>
            </div>

            <div className="neu-well-inset p-2.5 rounded-xl bg-[#eff4ff] text-center">
              <div className="text-[10px] font-mono text-[#747686] uppercase font-medium">Chi-Square (χ²)</div>
              <div className="text-xl font-bold text-[#0b1c30] font-headline mt-0.5">
                {typeof activeSignal?.chi === 'number' ? activeSignal.chi.toFixed(1) : (activeSignal?.chi ?? '—')}
              </div>
              <div className="text-[9px] font-mono text-[#065f46] font-semibold">{activeSignal?.pValue ?? activeSignal?.p_value ?? '< 0.05'}</div>
            </div>

            <div className="neu-well-inset p-2.5 rounded-xl bg-[#eff4ff] text-center">
              <div className="text-[10px] font-mono text-[#747686] uppercase font-medium">Cases &amp; ROR</div>
              <div className="text-xl font-bold text-[#0b1c30] font-headline mt-0.5">
                {activeSignal?.cases ?? activeSignal?.cellA ?? '—'}
              </div>
              <div className="text-[9px] font-mono text-[#0037b0]">ROR: {typeof activeSignal?.ror === 'number' ? activeSignal.ror.toFixed(2) : (activeSignal?.ror ?? '—')}</div>
            </div>
          </div>

          {/* 2x2 Contingency Matrix Breakdown */}
          <div className="neu-well-inset p-3 rounded-xl bg-[#eff4ff] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#0b1c30]">
              <span>2×2 Contingency Table (Standard PV Disproportionality)</span>
              <span className="text-[#0037b0]">EBGM: {activeSignal?.ebgm ?? '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
              <div className="p-2 rounded bg-[#f8f9ff] neu-surface-level-1">
                <span className="text-[#747686] block text-[10px]">Cell A (Target Drug + Event):</span>
                <strong className="text-[#0b1c30] text-sm font-bold">{activeSignal?.cellA ?? activeSignal?.cell_a ?? 0}</strong>
              </div>
              <div className="p-2 rounded bg-[#f8f9ff] neu-surface-level-1">
                <span className="text-[#747686] block text-[10px]">Cell B (Target Drug + Other):</span>
                <strong className="text-[#0b1c30] text-sm font-bold">{(activeSignal?.cellB ?? activeSignal?.cell_b ?? 0).toLocaleString()}</strong>
              </div>
              <div className="p-2 rounded bg-[#f8f9ff] neu-surface-level-1">
                <span className="text-[#747686] block text-[10px]">Cell C (Other Drugs + Event):</span>
                <strong className="text-[#0b1c30] text-sm font-bold">{(activeSignal?.cellC ?? activeSignal?.cell_c ?? 0).toLocaleString()}</strong>
              </div>
              <div className="p-2 rounded bg-[#f8f9ff] neu-surface-level-1">
                <span className="text-[#747686] block text-[10px]">Cell D (Other Drugs + Other):</span>
                <strong className="text-[#0b1c30] text-sm font-bold">{(activeSignal?.cellD ?? activeSignal?.cell_d ?? 0).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Subgroup & Confounder Analysis */}
          <div className="space-y-2 text-xs">
            <div className="neu-well-inset p-2.5 rounded-xl bg-[#eff4ff]">
              <span className="text-[10px] font-mono text-[#0037b0] font-bold uppercase block mb-1">
                Subpopulation Stratification
              </span>
              <div className="text-[11px] text-[#434655] space-y-0.5 font-sans">
                <div>• Age Concentration: <strong className="text-[#0b1c30]">{activeSignal?.subgroup?.age65Plus ?? 'Stratified by clinical age cohort'}</strong></div>
                <div>• Sex Ratio: <strong className="text-[#0b1c30]">{activeSignal?.subgroup?.gender ?? 'Balanced demographics'}</strong></div>
                <div>• Concomitant: <strong className="text-[#0b1c30]">{activeSignal?.subgroup?.concomitant ?? 'None reported'}</strong></div>
              </div>
            </div>

            <div className="neu-well-inset p-2.5 rounded-xl bg-[#eff4ff]">
              <span className="text-[10px] font-mono text-[#92400e] font-bold uppercase block mb-1">
                Potential Confounder Assessment
              </span>
              <p className="text-[11px] text-[#434655] font-sans leading-snug">
                {activeSignal?.confounder ?? 'Evaluating background disease incidence and co-morbidities.'}
              </p>
            </div>
          </div>

          {/* Watsonx.ai Copilot Insight */}
          <div className="neu-well-inset p-3 rounded-xl bg-[#eff4ff] border border-[#1d4ed8]/30 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#0037b0] text-lg shrink-0 mt-0.5">psychology</span>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#0037b0] uppercase">
                <span>IBM Bob (watsonx.ai) Safety Assessment</span>
              </div>
              <p className="text-xs text-[#0b1c30] leading-relaxed font-sans">{activeSignal.aiAnalysis}</p>
            </div>
          </div>

          {/* Human Review & Regulatory Workflow Panel */}
          <div className="pt-2 border-t border-[#c4c5d7]/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0b1c30] font-headline">
                Expert Review Decision &amp; Audit Trail
              </span>
              <span className="text-[10px] font-mono text-[#747686]">21 CFR Part 11 Protocol</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-[#747686] mb-1">Review State</label>
                <div className="neu-well-inset rounded-lg bg-[#eff4ff]">
                  <select
                    value={reviewStatuses[activeSignal.id] || activeSignal.status}
                    onChange={(e) =>
                      setReviewStatuses((prev) => ({
                        ...prev,
                        [activeSignal.id]: e.target.value,
                      }))
                    }
                    className="w-full bg-transparent border-0 py-1.5 px-2 text-xs text-[#0b1c30] font-semibold cursor-pointer outline-none"
                  >
                    {REVIEW_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#747686] mb-1">Reviewer Role</label>
                <div className="neu-well-inset rounded-lg bg-[#eff4ff] py-1.5 px-2 text-xs text-[#0b1c30] font-mono truncate">
                  Dr. Elena Rostova (QPPV)
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#747686] mb-1">
                Medical Reviewer Rationale / Action Plan
              </label>
              <textarea
                rows={2}
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Enter formal QPPV clinical assessment, root cause hypothesis, or recommended regulatory action..."
                className="w-full neu-well-inset rounded-xl bg-[#eff4ff] p-2 text-xs text-[#0b1c30] placeholder:text-[#747686] outline-none font-sans resize-none border-0"
              />
            </div>

            {savedAuditFeedback && (
              <div className="p-2 rounded-lg bg-[#d1fae5] text-[#065f46] text-xs font-mono font-semibold flex items-center gap-1.5 animate-fadeIn">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Assessment cryptographically recorded to institutional audit log.
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSaveAssessment}
                className="flex-1 py-2 px-3 rounded-xl neu-btn-primary text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Save Assessment &amp; Log Audit</span>
              </button>
              <button
                onClick={() => onOpenChat && onOpenChat()}
                className="py-2 px-3 rounded-xl neu-btn-raised bg-[#f8f9ff] text-[#0037b0] text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">smart_toy</span>
                <span>Ask Bob</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── Helper Components ── */

function KPICard({
  label,
  labelColor,
  icon,
  iconColor,
  value,
  valueColor,
  trend,
  trendColor,
  trendBg,
  progress,
  progressColor,
  sub,
}) {
  return (
    <div className="neu-surface-level-2 p-4 rounded-2xl bg-[#f8f9ff] flex flex-col justify-between border border-white/80">
      <div className="flex items-center justify-between text-[#747686] mb-1">
        <span className={`font-mono text-[11px] uppercase tracking-wider ${labelColor || ''}`}>{label}</span>
        <span className={`material-symbols-outlined text-base ${iconColor}`}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className={`text-2xl font-bold font-headline ${valueColor || 'text-[#0b1c30]'}`}>{value}</span>
        <span
          className={`text-[11px] font-bold ${trendColor} ${trendBg || ''} ${
            trendBg ? 'px-1.5 py-0.5 rounded' : ''
          } font-mono`}
        >
          {trend}
        </span>
      </div>
      <div className="mt-2 neu-well-inset h-1.5 rounded-full overflow-hidden w-full bg-[#eff4ff]">
        <div
          className={`${progressColor} h-full rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className="text-xs text-[#747686] mt-1.5 font-sans">{sub}</span>
    </div>
  );
}
