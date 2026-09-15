/**
 * Case Explorer & Data Quality Workspace
 * =====================================
 * Displays individual adverse event case reports (ICSRs),
 * quality scoring, and suspected duplicate candidates.
 */

import { useState, useEffect } from 'react';
import { fetchSafetyCases } from '../../api/client.js';

export default function CaseExplorer({ onNavigate }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrug, setSelectedDrug] = useState('');
  const [selectedSeriousness, setSelectedSeriousness] = useState('all');
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    loadCases();
  }, [selectedDrug, selectedSeriousness, duplicatesOnly]);

  async function loadCases() {
    setLoading(true);
    const data = await fetchSafetyCases(selectedDrug, selectedSeriousness, duplicatesOnly);
    if (data && data.cases) {
      setCases(data.cases);
    } else {
      // Offline fallback sample cases
      setCases([
        {
          id: 1,
          report_id: 'ICSR-2024-00912',
          case_id: 'CAS-PEM-101',
          drug: 'Pembrolizumab',
          patient_age: 68.0,
          patient_sex: 'Female',
          country: 'US',
          report_date: '2024-08-14',
          event_date: '2024-08-02',
          outcome: 'Recovering',
          seriousness: 'Serious',
          is_fatal: false,
          is_hospitalized: true,
          dose_text: '200 mg IV Q3W',
          indication: 'Metastatic Melanoma',
          concomitant_meds: 'Ipilimumab 3 mg/kg, Omeprazole 20 mg',
          narrative: 'A 68-year-old female patient with metastatic melanoma treated with Pembrolizumab and Ipilimumab developed severe abdominal cramping and Grade 3 diarrhea 12 days following Cycle 2.',
          quality_score: 96,
          is_duplicate_candidate: false,
        },
        {
          id: 2,
          report_id: 'ICSR-2024-00913',
          case_id: 'CAS-PEM-102',
          drug: 'Pembrolizumab',
          patient_age: 71.0,
          patient_sex: 'Male',
          country: 'DE',
          report_date: '2024-08-20',
          event_date: '2024-08-15',
          outcome: 'Fatal',
          seriousness: 'Serious',
          is_fatal: true,
          is_hospitalized: true,
          dose_text: '200 mg IV Q3W',
          indication: 'Non-Small Cell Lung Cancer',
          concomitant_meds: 'Doxorubicin, Lisinopril 10 mg',
          narrative: 'A 71-year-old male with NSCLC presented with acute dyspnea and elevated troponin I (14.2 ng/mL) 3 weeks post-dose. Endomyocardial biopsy confirmed lymphocytic myocarditis.',
          quality_score: 94,
          is_duplicate_candidate: false,
        },
        {
          id: 3,
          report_id: 'ICSR-2024-00914',
          case_id: 'CAS-PEM-102-DUP',
          drug: 'Pembrolizumab',
          patient_age: 71.0,
          patient_sex: 'Male',
          country: 'DE',
          report_date: '2024-08-22',
          event_date: '2024-08-15',
          outcome: 'Fatal',
          seriousness: 'Serious',
          is_fatal: true,
          is_hospitalized: true,
          dose_text: '200 mg IV Q3W',
          indication: 'Lung Neoplasm Malignant',
          concomitant_meds: 'Lisinopril',
          narrative: 'Relative reported patient died in ICU after heart complications following new immunotherapy infusion for lung cancer.',
          quality_score: 78,
          is_duplicate_candidate: true,
          duplicate_of_id: 'ICSR-2024-00913',
        },
        {
          id: 4,
          report_id: 'ICSR-2024-00915',
          case_id: 'CAS-SEM-201',
          drug: 'Semaglutide',
          patient_age: 42.0,
          patient_sex: 'Female',
          country: 'US',
          report_date: '2024-09-02',
          event_date: '2024-08-25',
          outcome: 'Not Recovered',
          seriousness: 'Serious',
          is_fatal: false,
          is_hospitalized: true,
          dose_text: '1.7 mg SubQ weekly',
          indication: 'Weight Management',
          concomitant_meds: 'Levothyroxine 75 mcg',
          narrative: 'A 42-year-old female receiving Semaglutide for weight loss presented with intractable nausea, postprandial vomiting, and early satiety. Gastric scintigraphy demonstrated 4-hour retention of 64%.',
          quality_score: 98,
          is_duplicate_candidate: false,
        }
      ]);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight font-headline">
              Individual Safety Case Explorer (ICSR)
            </h1>
            <span className="neu-raised-sm px-2.5 py-1 rounded-full text-[11px] font-mono bg-surface-container-high text-primary font-semibold">
              E2B(R3) Validated Cohort
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Browse ingested adverse event reports, inspect data quality scores, and review duplicate candidates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate('dataset_upload')}
            className="neu-primary-extruded text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
            <span>Upload New Dataset</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="neu-raised-card bg-surface p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 border border-outline-variant/30">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by drug name..."
              value={selectedDrug}
              onChange={(e) => setSelectedDrug(e.target.value)}
              className="neu-well-inset bg-[#eff4ff] text-xs px-3 py-2 rounded-lg text-on-surface outline-none w-56"
            />
          </div>

          <select
            value={selectedSeriousness}
            onChange={(e) => setSelectedSeriousness(e.target.value)}
            className="neu-well-inset bg-[#eff4ff] text-xs px-3 py-2 rounded-lg text-on-surface outline-none cursor-pointer"
          >
            <option value="all">All Seriousness Tiers</option>
            <option value="Serious">Serious Cases Only</option>
            <option value="Non-Serious">Non-Serious Cases</option>
          </select>

          <label className="flex items-center gap-2 text-xs font-semibold text-on-surface cursor-pointer select-none">
            <input
              type="checkbox"
              checked={duplicatesOnly}
              onChange={(e) => setDuplicatesOnly(e.target.checked)}
              className="rounded border-outline text-primary focus:ring-0 cursor-pointer"
            />
            <span>Duplicate Candidates Only</span>
          </label>
        </div>

        <div className="text-xs font-mono text-on-surface-variant">
          Showing <span className="font-bold text-primary">{cases.length}</span> safety reports
        </div>
      </div>

      {/* Case Records Table */}
      <div className="neu-raised-card bg-surface rounded-xl overflow-hidden border border-outline-variant/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#eff4ff] border-b border-outline-variant/40 text-on-surface-variant font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Report ID</th>
                <th className="py-3 px-4 font-semibold">Drug / Moiety</th>
                <th className="py-3 px-4 font-semibold">Patient Demographics</th>
                <th className="py-3 px-4 font-semibold">Seriousness / Outcome</th>
                <th className="py-3 px-4 font-semibold">Receipt Date</th>
                <th className="py-3 px-4 font-semibold">Quality Score</th>
                <th className="py-3 px-4 font-semibold">Duplicate Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-body">
              {cases.map((c) => (
                <tr key={c.report_id} className="hover:bg-[#eff4ff]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-primary">{c.report_id}</td>
                  <td className="py-3 px-4 font-semibold text-on-surface">{c.drug}</td>
                  <td className="py-3 px-4 text-on-surface-variant">
                    {c.patient_age ? `${c.patient_age} yrs` : 'Age N/A'} • {c.patient_sex || 'Unknown'} ({c.country || 'US'})
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      c.is_fatal ? 'bg-[#fde8ec] text-[#9f1239]' :
                      c.seriousness === 'Serious' ? 'bg-[#fef3c7] text-[#92400e]' :
                      'bg-[#e5eeff] text-[#0037b0]'
                    }`}>
                      {c.is_fatal ? 'Fatal' : c.seriousness} • {c.outcome || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-outline">{c.report_date || '2024-08-14'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 bg-surface-container rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${c.quality_score >= 85 ? 'bg-[#006948]' : 'bg-[#d97706]'}`}
                          style={{ width: `${c.quality_score}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-[11px] font-bold">{c.quality_score}/100</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {c.is_duplicate_candidate ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#fef3c7] text-[#92400e] text-[10px] font-mono font-bold">
                        <span className="material-symbols-outlined text-xs">content_copy</span>
                        Suspected Duplicate ({c.duplicate_of_id})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#d1fae5] text-[#065f46] text-[10px] font-mono">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        Unique Record
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedCase(c)}
                      className="px-2.5 py-1 rounded bg-[#eff4ff] hover:bg-surface-container text-primary font-semibold text-xs transition-colors cursor-pointer"
                    >
                      View Narrative
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="neu-surface-level-2 bg-surface max-w-2xl w-full rounded-2xl p-6 space-y-4 border border-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div>
                <h3 className="text-lg font-bold text-on-surface font-headline">
                  Individual Safety Case: {selectedCase.report_id}
                </h3>
                <p className="text-xs text-on-surface-variant font-mono">
                  Case ID: {selectedCase.case_id} • Drug: {selectedCase.drug}
                </p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-1 rounded hover:bg-surface-container text-outline hover:text-error"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-body">
              <div className="neu-well-inset bg-[#eff4ff] p-3 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-outline uppercase font-bold">Patient & Regimen</span>
                <p><strong>Age / Sex:</strong> {selectedCase.patient_age || 'N/A'} yrs • {selectedCase.patient_sex}</p>
                <p><strong>Country:</strong> {selectedCase.country}</p>
                <p><strong>Dose:</strong> {selectedCase.dose_text || 'Standard protocol'}</p>
                <p><strong>Indication:</strong> {selectedCase.indication || 'Not recorded'}</p>
              </div>

              <div className="neu-well-inset bg-[#eff4ff] p-3 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-outline uppercase font-bold">Clinical Outcome</span>
                <p><strong>Seriousness:</strong> {selectedCase.seriousness}</p>
                <p><strong>Fatal:</strong> {selectedCase.is_fatal ? 'Yes' : 'No'}</p>
                <p><strong>Hospitalized:</strong> {selectedCase.is_hospitalized ? 'Yes' : 'No'}</p>
                <p><strong>Concomitant Meds:</strong> {selectedCase.concomitant_meds || 'None reported'}</p>
              </div>
            </div>

            <div className="neu-well-inset bg-[#eff4ff] p-3.5 rounded-xl space-y-2">
              <span className="text-[10px] font-mono text-outline uppercase font-bold">Clinical Case Narrative</span>
              <p className="text-xs text-on-surface leading-relaxed whitespace-pre-wrap">
                {selectedCase.narrative || 'No free-text narrative recorded in submission dataset.'}
              </p>
            </div>

            {selectedCase.is_duplicate_candidate && (
              <div className="p-3 rounded-xl bg-[#fef3c7] border border-[#f59e0b]/40 text-xs text-[#92400e] space-y-1">
                <p className="font-bold font-headline flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  Suspected Duplicate Case Warning
                </p>
                <p>
                  This case shares matching demographics, adverse event onset, and clinical narrative with master case <strong>{selectedCase.duplicate_of_id}</strong>. Do not count twice in disproportionality calculations.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 rounded-lg neu-raised-card text-on-surface font-semibold text-xs hover:bg-surface-container"
              >
                Close Case Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
