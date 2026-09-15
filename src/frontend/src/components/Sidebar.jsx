import { useState } from 'react';
import BrandLogo from './BrandLogo.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'signal',    icon: 'query_stats', label: 'Signal Detection' },
  { id: 'dossier',   icon: 'verified',    label: 'Submission Readiness' },
  { id: 'reports',   icon: 'assessment',  label: 'Reports' },
  { id: 'data',      icon: 'database',    label: 'Data Sources' },
  { id: 'settings',  icon: 'settings',    label: 'Settings' },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 z-50 flex flex-col justify-between p-4 bg-[#eff4ff] border-r border-[#c4c5d7]/40 shadow-sm transition-all duration-200">
      <div className="flex flex-col gap-5">
        {/* Rail Header — Official Brand Logo */}
        <div className="px-1 pt-1">
          <BrandLogo textVariant="short" />
        </div>

        {/* Quick Action CTA */}
        <button className="w-full py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-white font-semibold text-sm neu-primary-extruded active:scale-[0.98] transition-all font-headline">
          <span className="material-symbols-outlined text-sm">add_circle</span>
          <span>New Safety Case</span>
        </button>

        {/* Primary Navigation Rail */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
          {NAV_ITEMS.map(item => {
            const isActive = activePage === item.id;
            return (
              <a
                key={item.id}
                href="#"
                onClick={e => { e.preventDefault(); onNavigate(item.id); }}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-150 active:scale-[0.98] ${
                  isActive
                    ? 'bg-surface-container text-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-normal'
                }`}
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="text-[13px] font-mono">{item.label}</span>
                {isActive && <span className="ml-auto w-2 h-2 rounded-full bg-primary"></span>}
              </a>
            );
          })}
        </nav>
      </div>

      {/* SideNav Regulatory Footer */}
      <div className="border-t border-outline-variant/30 pt-3 flex flex-col gap-1">
        <a href="#" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-on-surface-variant text-xs hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-sm">history_edu</span>
          <span className="text-[11px] font-mono">Audit Trail</span>
        </a>
        <a href="#" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-on-surface-variant text-xs hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-sm">policy</span>
          <span className="text-[11px] font-mono">Compliance Docs</span>
        </a>
        <div className="mt-2 px-2 py-1.5 rounded neu-recessed-well bg-surface-container-low text-[10px] text-outline font-mono flex items-center justify-between">
          <span>21 CFR Part 11</span>
          <span className="inline-block w-2 h-2 rounded-full bg-tertiary"></span>
        </div>
      </div>
    </aside>
  );
}
