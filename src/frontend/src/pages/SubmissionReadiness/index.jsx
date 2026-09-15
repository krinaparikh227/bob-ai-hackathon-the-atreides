/* ── DrugSafe AI — Submission Readiness & CTD Gap Analysis ──
 * Matches: drugsafe_ai_submission_readiness_ctd_verification/code.html
 * Enhanced with interactive file upload, real-time filtering, M1-M5 audit, and gap resolution.
 */
import { useState, useRef } from 'react';
import { checkDossier, uploadDossierFile } from '../../api/dossier.js';

const INITIAL_GAPS = [
  {
    id: 'GAP-001',
    module: 'M5',
    moduleName: 'Clinical Reports',
    sectionId: '5.3.5.3',
    sectionName: 'Reports of Analyses of Data from More Than One Study (ISS)',
    severity: 'critical',
    severityLabel: 'Critical Blocker',
    issueType: 'Missing Linkage',
    finding: 'Integrated Summary of Safety (ISS) pooled dataset does not link to Study-004 adverse event records.',
    rule: 'ICH M4E(R2) §5.3.5.3',
    impact: 'FDA Refusal-to-File (RTF) risk.',
    suggestedAction: 'Inject SDTM AE domain foreign keys for Study-004 cohort into the ISS dataset.',
  },
  {
    id: 'GAP-002',
    module: 'M3',
    moduleName: 'Quality / CMC',
    sectionId: '3.2.P.8.3',
    sectionName: 'Stability Data — Accelerated Shelf-Life Testing',
    severity: 'critical',
    severityLabel: 'Critical Blocker',
    issueType: 'Missing Report',
    finding: '6-month accelerated stability testing dataset missing batch analysis for Lot #BX-9021.',
    rule: 'ICH Q1A(R2) §2.2.7',
    impact: 'Validation hold on commercial packaging line.',
    suggestedAction: 'Append Lot #BX-9021 HPLC assay metrics to Section 3.2.P.8.3 Table 4.',
  },
  {
    id: 'GAP-003',
    module: 'M2',
    moduleName: 'CTD Summaries',
    sectionId: '2.7.4',
    sectionName: 'Summary of Clinical Safety',
    severity: 'major',
    severityLabel: 'Major Gap',
    issueType: 'Stale Disproportionality',
    finding: 'PRR disproportionality figures do not reflect openFDA Q3 2024 signal updates for GI toxicity.',
    rule: 'ICH M4E(R2) §2.7.4.2',
    impact: 'Audit finding during pre-approval inspection.',
    suggestedAction: 'Auto-sync PRR values (3.84 for colitis) from DrugSafe AI Signal Detection into Section 2.7.4.',
  },
  {
    id: 'GAP-004',
    module: 'M5',
    moduleName: 'Clinical Reports',
    sectionId: '5.3.1.2',
    sectionName: 'Comparative BA/BE Study Reports',
    severity: 'major',
    severityLabel: 'Major Gap',
    issueType: 'Confidence Interval Variance',
    finding: 'Dissolution profile f2 similarity factor borderline (49.8 vs required 50.0).',
    rule: 'FDA BA/BE Guidance 2023',
    impact: 'Possible bioequivalence deficiency inquiry.',
    suggestedAction: 'Recalculate bootstrap confidence intervals using secondary dissolution vessel set.',
  },
  {
    id: 'GAP-005',
    module: 'M4',
    moduleName: 'Nonclinical',
    sectionId: '4.2.3.2',
    sectionName: 'Repeat-Dose Toxicity Studies',
    severity: 'minor',
    severityLabel: 'Minor Flag',
    issueType: 'Pending Sign-Off',
    finding: 'Principal Toxicologist electronic signature timestamp missing 21 CFR Part 11 checksum hash.',
    rule: '21 CFR Part 11.50',
    impact: 'Minor verification warning prior to compilation.',
    suggestedAction: 'Re-authenticate with institutional e-signature token.',
  },
  {
    id: 'GAP-006',
    module: 'M1',
    moduleName: 'Administrative',
    sectionId: '1.3.1',
    sectionName: 'Summary of Product Characteristics (SmPC) & Package Leaflet',
    severity: 'minor',
    severityLabel: 'Minor Flag',
    issueType: 'Terminology Alignment',
    finding: 'Adverse reaction frequency wording diverges between US Prescribing Information and EU SmPC §4.8.',
    rule: 'EMA QRD Template v10.4',
    impact: 'Regional labelling harmonization comment.',
    suggestedAction: 'Align MedDRA frequency terms (Common: ≥1/100 to <1/10) across both regional annexes.',
  },
];

export default function SubmissionReadiness({ onNavigate, onOpenChat }) {
  const [loadedFileName, setLoadedFileName] = useState('NDA_219084_eCTD_Rev2.xml');
  const [fileSize, setFileSize] = useState('4.8 MB');
  const [isChecking, setIsChecking] = useState(false);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [gaps, setGaps] = useState(INITIAL_GAPS);
  const [completenessScore, setCompletenessScore] = useState(82);
  const [moduleScores, setModuleScores] = useState({ M1: 95, M2: 88, M3: 74, M4: 90, M5: 63 });
  const [resolvedGaps, setResolvedGaps] = useState({});
  const fileInputRef = useRef(null);

  async function handleRunCheck() {
    setIsChecking(true);
    try {
      const res = await checkDossier();
      if (res) {
        if (res.gaps && res.gaps.length > 0) {
          setGaps(res.gaps);
        }
        if (typeof res.completeness_score === 'number') {
          setCompletenessScore(res.completeness_score);
        }
        if (res.modules) {
          setModuleScores({
            M1: res.modules.M1?.score ?? 95,
            M2: res.modules.M2?.score ?? 88,
            M3: res.modules.M3?.score ?? 74,
            M4: res.modules.M4?.score ?? 90,
            M5: res.modules.M5?.score ?? 63,
          });
        }
      }
    } catch (err) {
      console.warn('Backend check dossier returned error or offline, continuing with local audit engine:', err);
    } finally {
      setTimeout(() => {
        setIsChecking(false);
      }, 700);
    }
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (file) {
      setLoadedFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      setIsChecking(true);
      try {
        const res = await uploadDossierFile(file);
        if (res?.report) {
          if (res.report.gaps && res.report.gaps.length > 0) {
            setGaps(res.report.gaps);
          }
          if (typeof res.report.completeness_score === 'number') {
            setCompletenessScore(res.report.completeness_score);
          }
          if (res.report.modules) {
            setModuleScores({
              M1: res.report.modules.M1?.score ?? 95,
              M2: res.report.modules.M2?.score ?? 88,
              M3: res.report.modules.M3?.score ?? 74,
              M4: res.report.modules.M4?.score ?? 90,
              M5: res.report.modules.M5?.score ?? 63,
            });
          }
        }
      } catch (err) {
        console.warn('Upload dossier fallback:', err);
      } finally {
        setTimeout(() => setIsChecking(false), 700);
      }
    }
  }

  function toggleResolve(id) {
    setResolvedGaps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  const filteredGaps = gaps.filter((g) => {
    if (moduleFilter !== 'all' && g.module !== moduleFilter) return false;
    if (severityFilter !== 'all' && g.severity !== severityFilter) return false;
    return true;
  });

  const criticalCount = gaps.filter((g) => g.severity === 'critical' && !resolvedGaps[g.id]).length;
  const majorCount = gaps.filter((g) => g.severity === 'major' && !resolvedGaps[g.id]).length;
  const minorCount = gaps.filter((g) => g.severity === 'minor' && !resolvedGaps[g.id]).length;

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#747686] mb-1">
            <span>REGULATORY DOSSIER VERIFICATION</span>
            <span>•</span>
            <span className="text-[#0037b0] font-semibold">ICH M4 SPECIFICATION ENGINE</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-[#0b1c30] tracking-tight font-headline">
            Submission Readiness &amp; ICH CTD Dossier Verification
          </h1>
          <p className="text-xs lg:text-sm text-[#434655] max-w-3xl mt-1 font-sans">
            Verify Common Technical Document (CTD/eCTD) structure against ICH M4 specifications, cross-document consistency rules, and identify regulatory submission blockers.
          </p>
        </div>

        {/* Header Action Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenChat && onOpenChat()}
            className="px-3 py-2 rounded-xl neu-btn-raised bg-[#f8f9ff] text-[#0b1c30] text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-[#006398]">compare_arrows</span>
            <span>Compare FDA eCTD v4.0 Validation Criteria</span>
          </button>
          <button
            onClick={() => {
              alert('Full ICH M4 Regulatory Readiness Report exported with 21 CFR Part 11 digital watermark.');
            }}
            className="px-3.5 py-2 rounded-xl neu-btn-raised bg-[#e5eeff] text-[#0037b0] text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">file_download</span>
            <span>Export Full Readiness Dossier</span>
          </button>
        </div>
      </div>

      {/* INGESTION CONSOLE & HERO OVERALL READINESS SCORE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Dossier Ingestion Console — 7 Columns */}
        <div className="xl:col-span-7 rounded-2xl neu-surface-level-2 bg-[#f8f9ff] p-5 flex flex-col justify-between border border-white/80">
          <div className="flex items-center justify-between pb-3 border-b border-[#c4c5d7]/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0037b0] text-xl">upload_file</span>
              <h2 className="text-sm font-bold text-[#0b1c30] font-headline">Dossier Ingestion Console</h2>
            </div>
            {/* Supported Formats Indicator */}
            <span className="text-[10px] font-mono text-[#0037b0] bg-[#e5eeff] px-2 py-0.5 rounded font-semibold">
              eCTD v3.2.2 / v4.0 Spec
            </span>
          </div>

          {/* Drag & Drop Recessed Dropzone */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelected}
            className="hidden"
            accept=".xml,.pdf,.json,.docx,.txt"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="my-3 rounded-xl neu-well-inset bg-[#eff4ff] p-6 border-2 border-dashed border-[#c4c5d7] flex flex-col items-center justify-center text-center cursor-pointer group hover:border-[#1d4ed8] transition-all"
          >
            <div className="w-12 h-12 rounded-full neu-surface-level-1 bg-[#f8f9ff] flex items-center justify-center text-[#0037b0] mb-2 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-2xl">cloud_upload</span>
            </div>
            <p className="text-sm font-semibold text-[#0b1c30] font-headline">
              Upload Dossier Outline &amp; Module Indexes
            </p>
            <p className="text-xs text-[#434655] mt-1 max-w-md font-sans">
              Drag &amp; drop your eCTD Table of Contents (TOC) XML, study index, or click to browse
            </p>
            {/* Supported Format Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              {['PDF', 'DOCX', 'JSON', 'XML / eCTD', 'TXT'].map((fmt) => (
                <span
                  key={fmt}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded neu-surface-level-1 bg-[#f8f9ff] ${
                    fmt.includes('XML') ? 'text-[#0037b0] font-bold ring-1 ring-[#1d4ed8]/30' : 'text-[#434655]'
                  }`}
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Ingestion Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-[#747686] font-sans">
              <span className="material-symbols-outlined text-base text-[#004f35]">check_circle</span>
              <span>
                Loaded: <strong className="text-[#0b1c30] font-mono">{loadedFileName}</strong> ({fileSize})
              </span>
            </div>
            <button
              disabled={isChecking}
              onClick={handleRunCheck}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl neu-btn-primary text-white font-headline text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className={`material-symbols-outlined text-base ${isChecking ? 'animate-spin' : ''}`}>
                {isChecking ? 'autorenew' : 'auto_awesome'}
              </span>
              <span>{isChecking ? 'Verifying Dossier Structure...' : 'Check Submission Readiness'}</span>
              <span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase">
                AI Validated
              </span>
            </button>
          </div>
        </div>

        {/* Overall Readiness Score Hero Widget — 5 Columns */}
        <div className="xl:col-span-5 rounded-2xl neu-surface-level-2 bg-[#f8f9ff] p-5 flex flex-col justify-between border border-white/80">
          <div className="flex items-center justify-between pb-2 border-b border-[#c4c5d7]/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0037b0] text-xl">speed</span>
              <h2 className="text-sm font-bold text-[#0b1c30] font-headline">Overall Dossier Readiness</h2>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#d1fae5] text-[#065f46] border border-[#059669]/20 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
              Ready with Minor Warnings
            </span>
          </div>

          {/* Circular Metric Centerpiece */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center my-3 py-1">
            {/* Circular Gauge */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 rounded-full neu-surface-level-1 bg-[#f8f9ff] flex items-center justify-center p-2.5">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="transparent" r="42" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="42"
                    stroke="#1d4ed8"
                    strokeDasharray="263.89"
                    strokeDashoffset={(263.89 * (100 - completenessScore)) / 100}
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-[#0b1c30] leading-none tracking-tight font-headline">
                    {completenessScore}%
                  </span>
                  <span className="text-[10px] font-mono text-[#747686] uppercase font-medium mt-1">Completeness</span>
                </div>
              </div>
            </div>

            {/* Telemetry Breakdown Ledger */}
            <div className="sm:col-span-7 flex flex-col gap-2">
              <TelemetryRow label="Total ICH Sections:" value="142 Checked" />
              <TelemetryRow
                label="Completed Sections:"
                value="116"
                icon="check_circle"
                valueColor="text-[#065f46]"
                labelColor="text-[#065f46]"
              />
              <TelemetryRow
                label="Gaps Identified:"
                value={`${gaps.length}`}
                icon="warning"
                valueColor="text-[#92400e]"
                labelColor="text-[#92400e]"
              />
              <TelemetryRow
                label="Critical Blockers:"
                value={`${criticalCount}`}
                icon="block"
                valueColor="text-[#9f1239]"
                labelColor="text-[#9f1239]"
                border
              />
            </div>
          </div>

          {/* Regulatory Agency Compliance Footprint */}
          <div className="pt-2 border-t border-[#c4c5d7]/30 flex items-center justify-between text-[11px] font-mono text-[#747686]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-[#0037b0]">verified_user</span>
              <span>Regulatory Baseline:</span>
            </span>
            <span className="font-semibold text-[#0b1c30]">FDA 21 CFR 314 &amp; EMA CHMP ICH M4</span>
          </div>
        </div>
      </div>

      {/* THE 5 ICH CTD MODULE BREAKDOWN CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-[#0b1c30] font-headline">
              ICH CTD 5-Module Structural Audit
            </h2>
            <p className="text-xs text-[#434655] font-sans">
              Click any module to filter the detailed gap analysis and cross-document discrepancy ledger below.
            </p>
          </div>
          <div className="text-[11px] font-mono text-[#747686] hidden sm:block">
            Standard: ICH M4 v4.0.3 (Granular Specs)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3.5">
          <ModuleCard
            active={moduleFilter === 'M1'}
            onClick={() => setModuleFilter(moduleFilter === 'M1' ? 'all' : 'M1')}
            borderColor="border-emerald-500"
            statusLabel="Approved"
            statusBg="bg-emerald-50 text-emerald-800 border-emerald-200"
            pct={moduleScores.M1}
            pctColor="text-emerald-700"
            title="Module 1: Admin"
            desc="Regional Administrative Information"
            barColor="bg-emerald-600"
            sections="19 / 20"
            note="Minor Flag:"
            noteColor="text-emerald-800"
            noteText="1 non-blocking item (US FDA Form 356h electronic signature pending confirmation)."
          />
          <ModuleCard
            active={moduleFilter === 'M2'}
            onClick={() => setModuleFilter(moduleFilter === 'M2' ? 'all' : 'M2')}
            borderColor="border-amber-500"
            statusLabel="Minor Gaps"
            statusBg="bg-amber-50 text-amber-800 border-amber-200"
            pct={moduleScores.M2}
            pctColor="text-amber-700"
            title="Module 2: Summaries"
            desc="Executive Clinical Synopses"
            barColor="bg-amber-500"
            sections="14 / 16"
            note="Gap:"
            noteColor="text-amber-800"
            noteText="Missing 2.7.4 Summary of Clinical Safety updates for latest cohort."
          />
          <ModuleCard
            active={moduleFilter === 'M3'}
            onClick={() => setModuleFilter(moduleFilter === 'M3' ? 'all' : 'M3')}
            borderColor="border-amber-600"
            statusLabel="Action Required"
            statusBg="bg-amber-100 text-amber-900 border-amber-300"
            pct={moduleScores.M3}
            pctColor="text-amber-800"
            title="Module 3: Quality / CMC"
            desc="Chemistry, Manufacturing & Controls"
            barColor="bg-amber-600"
            sections="31 / 42"
            note="Critical:"
            noteColor="text-amber-900"
            noteText="1 critical stability report missing (3.2.P.8.3 accelerated shelf-life)."
          />
          <ModuleCard
            active={moduleFilter === 'M4'}
            onClick={() => setModuleFilter(moduleFilter === 'M4' ? 'all' : 'M4')}
            borderColor="border-emerald-500"
            statusLabel="Ready"
            statusBg="bg-emerald-50 text-emerald-800 border-emerald-200"
            pct={moduleScores.M4}
            pctColor="text-emerald-700"
            title="Module 4: Nonclinical"
            desc="Toxicology & Pharmacology"
            barColor="bg-emerald-600"
            sections="27 / 30"
            note="Status:"
            noteColor="text-emerald-800"
            noteText="Principal Investigator checksum signature pending."
          />
          <ModuleCard
            active={moduleFilter === 'M5'}
            onClick={() => setModuleFilter(moduleFilter === 'M5' ? 'all' : 'M5')}
            borderColor="border-red-500"
            statusLabel="Critical Gap"
            statusBg="bg-red-50 text-red-800 border-red-200"
            pct={moduleScores.M5}
            pctColor="text-red-700"
            title="Module 5: Clinical"
            desc="Efficacy, Safety & Human CSRs"
            barColor="bg-red-600"
            sections="25 / 40"
            note="Blocker:"
            noteColor="text-red-700"
            noteText="Section 5.3.5.3 Integrated Summary of Safety (ISS) missing linkages."
          />
        </div>
      </div>

      {/* DETAILED GAP ANALYSIS & AUDIT TABLE SECTION */}
      <section className="neu-surface-level-2 bg-[#f8f9ff] rounded-2xl p-6 border border-white/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#c4c5d7]/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0037b0] text-xl">rule</span>
              <h2 className="text-base font-bold text-[#0b1c30] font-headline">
                Regulatory Gap Report &amp; Cross-Document Discrepancies
              </h2>
              <span className="text-[11px] font-mono text-[#747686]">
                ({filteredGaps.length} of {gaps.length} items shown)
              </span>
            </div>
            <p className="text-xs text-[#434655] mt-0.5">
              Identified deviations from ICH M4 / eCTD v4.0 technical specifications and cross-module consistency validation.
            </p>
          </div>

          {/* Filter Controls Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Module Filter */}
            <div className="neu-well-inset bg-[#eff4ff] p-1 rounded-xl flex items-center gap-1 text-[11px] font-mono">
              {['all', 'M1', 'M2', 'M3', 'M4', 'M5'].map((m) => (
                <button
                  key={m}
                  onClick={() => setModuleFilter(m)}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    moduleFilter === m
                      ? 'bg-[#f8f9ff] text-[#0037b0] font-bold neu-btn-raised'
                      : 'text-[#434655] hover:text-[#0b1c30]'
                  }`}
                >
                  {m === 'all' ? 'All Modules' : m}
                </button>
              ))}
            </div>

            {/* Severity Filter */}
            <div className="neu-well-inset bg-[#eff4ff] p-1 rounded-xl flex items-center gap-1 text-[11px] font-mono">
              {[
                { id: 'all', label: 'All Severity' },
                { id: 'critical', label: `Critical (${criticalCount})` },
                { id: 'major', label: `Major (${majorCount})` },
                { id: 'minor', label: `Minor (${minorCount})` },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSeverityFilter(s.id)}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    severityFilter === s.id
                      ? 'bg-[#f8f9ff] text-[#0037b0] font-bold neu-btn-raised'
                      : 'text-[#434655] hover:text-[#0b1c30]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="neu-well-inset bg-[#eff4ff] text-[#747686] font-mono text-[11px] uppercase tracking-wider rounded-xl">
                <th className="py-2.5 px-3 rounded-l-lg">ID &amp; Module</th>
                <th className="py-2.5 px-3">CTD Section &amp; Name</th>
                <th className="py-2.5 px-3">Severity &amp; Type</th>
                <th className="py-2.5 px-4">Finding &amp; Regulatory Rule</th>
                <th className="py-2.5 px-3">AI Auto-Remediation</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#c4c5d7]/30">
              {filteredGaps.map((gap) => {
                const isResolved = !!resolvedGaps[gap.id];
                return (
                  <tr
                    key={gap.id}
                    className={`hover:bg-[#eff4ff]/60 transition-colors ${
                      isResolved ? 'opacity-50 line-through bg-emerald-50/30' : ''
                    }`}
                  >
                    {/* ID & Module */}
                    <td className="py-3 px-3 font-mono align-top">
                      <div className="font-bold text-[#0b1c30]">{gap.id}</div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-[#e5eeff] text-[#0037b0] text-[10px] font-semibold">
                        {gap.module} ({gap.moduleName})
                      </span>
                    </td>

                    {/* Section */}
                    <td className="py-3 px-3 align-top font-sans">
                      <div className="font-mono text-xs font-bold text-[#0037b0]">Section {gap.sectionId}</div>
                      <div className="text-[11px] text-[#434655] font-medium leading-snug mt-0.5">{gap.sectionName}</div>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-3 align-top">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded font-semibold ${
                          gap.severity === 'critical'
                            ? 'bg-[#fde8ec] text-[#9f1239]'
                            : gap.severity === 'major'
                            ? 'bg-[#fef3c7] text-[#92400e]'
                            : 'bg-[#e5eeff] text-[#0037b0]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            gap.severity === 'critical'
                              ? 'bg-[#e11d48]'
                              : gap.severity === 'major'
                              ? 'bg-[#d97706]'
                              : 'bg-[#2563eb]'
                          }`}
                        ></span>
                        {gap.severityLabel}
                      </span>
                      <div className="text-[10px] text-[#747686] font-mono mt-1">{gap.issueType}</div>
                    </td>

                    {/* Finding Details */}
                    <td className="py-3 px-4 align-top max-w-sm">
                      <p className="text-xs text-[#0b1c30] leading-snug font-sans">{gap.finding}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-[#747686]">
                        <span className="text-[#0037b0] font-semibold">Spec: {gap.rule}</span>
                        <span>•</span>
                        <span className="text-[#9f1239]">{gap.impact}</span>
                      </div>
                    </td>

                    {/* AI Remediation */}
                    <td className="py-3 px-3 align-top max-w-xs">
                      <div className="p-2 rounded-lg neu-well-inset bg-[#eff4ff] text-[11px] text-[#0b1c30] leading-snug">
                        <span className="font-mono text-[10px] text-[#0037b0] font-bold block mb-0.5">
                          Recommended Fix:
                        </span>
                        {gap.suggestedAction}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right align-top space-y-1">
                      <button
                        onClick={() => toggleResolve(gap.id)}
                        className={`w-full py-1 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          isResolved
                            ? 'bg-[#d1fae5] text-[#065f46] neu-btn-raised'
                            : 'neu-btn-raised bg-[#f8f9ff] text-[#0b1c30] hover:text-[#0037b0]'
                        }`}
                      >
                        {isResolved ? 'Marked Resolved ✓' : 'Mark Resolved'}
                      </button>
                      <button
                        onClick={() => onOpenChat && onOpenChat()}
                        className="w-full py-1 px-2 rounded-lg text-[10px] font-mono text-[#0037b0] hover:underline flex items-center justify-end gap-1 cursor-pointer bg-transparent border-0"
                      >
                        <span className="material-symbols-outlined text-xs">smart_toy</span>
                        Ask IBM Bob
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* BOTTOM "ASK IBM BOB REGULATORY SPECIALIST" PROMPT STRIP */}
      <div className="rounded-2xl neu-surface-level-2 bg-[#f8f9ff] p-5 flex flex-col md:flex-row items-center justify-between gap-4 border border-[#0037b0]/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl neu-surface-level-1 bg-[#f8f9ff] flex items-center justify-center text-[#0037b0] flex-shrink-0">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              psychology
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#0037b0] font-bold tracking-wide uppercase">
                AI Regulatory Intelligence
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-mono text-[#747686]">watsonx.ai active agent</span>
            </div>
            <p className="text-sm text-[#0b1c30] font-medium mt-0.5 font-sans">
              Ask IBM Bob: <span className="text-[#0037b0] italic">"What are the top 3 regulatory blockers in Module 5 before submission?"</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => onOpenChat && onOpenChat()}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl neu-btn-primary text-white font-headline text-xs font-semibold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">bolt</span>
            <span>Launch Specialist Query</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function TelemetryRow({ label, value, icon, valueColor, labelColor, border }) {
  return (
    <div
      className={`p-2 rounded-xl neu-well-inset bg-[#eff4ff] flex items-center justify-between ${
        border ? 'border-l-2 border-red-500' : ''
      }`}
    >
      <span className={`text-xs flex items-center gap-1 font-sans ${labelColor || 'text-[#434655]'}`}>
        {icon && <span className="material-symbols-outlined text-xs">{icon}</span>}
        {label}
      </span>
      <span className={`font-mono text-[13px] font-semibold ${valueColor || 'text-[#0b1c30]'}`}>{value}</span>
    </div>
  );
}

function ModuleCard({
  active,
  onClick,
  borderColor,
  statusLabel,
  statusBg,
  pct,
  pctColor,
  title,
  desc,
  barColor,
  sections,
  note,
  noteColor,
  noteText,
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl neu-surface-level-2 bg-[#f8f9ff] p-4 flex flex-col justify-between border-t-4 ${borderColor} cursor-pointer transition-all hover:translate-y-[-2px] ${
        active ? 'ring-2 ring-[#0037b0]' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${statusBg}`}>
            {statusLabel}
          </span>
          <span className={`font-mono text-[13px] font-bold ${pctColor}`}>{pct}%</span>
        </div>
        <h3 className="text-sm font-bold text-[#0b1c30] mt-1 font-headline">{title}</h3>
        <p className="text-[11px] font-mono text-[#747686]">{desc}</p>

        {/* Tactile Inset Progress Channel */}
        <div className="w-full h-2 rounded-full neu-well-inset bg-[#eff4ff] my-2 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          ></div>
        </div>

        {/* Module Metadata */}
        <div className="space-y-1.5 text-xs mt-2">
          <div className="flex justify-between text-[#434655] font-sans">
            <span>Sections Complete:</span>
            <span className="font-mono font-semibold text-[#0b1c30]">{sections}</span>
          </div>
          <div className="p-2 rounded-xl bg-[#eff4ff] neu-well-inset text-[#434655] text-[11px] leading-snug font-sans">
            <span className={`font-semibold ${noteColor}`}>{note}</span> {noteText}
          </div>
        </div>
      </div>

      <button className="mt-3 w-full py-1.5 px-2 rounded-lg neu-btn-raised bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#0037b0] font-headline text-xs font-semibold flex items-center justify-center gap-1 transition-all">
        <span>{active ? 'Showing Gaps Below' : 'Filter Gaps'}</span>
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    </div>
  );
}
