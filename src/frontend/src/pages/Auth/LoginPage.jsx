/* ── DrugSafe AI — Login Access Portal ──
 * Matches: stitch_drugsafe_ai_ui_prototype/drugsafe_ai_login_access_portal/code.html
 */
import { useState } from 'react';
import BrandLogo from '../../components/BrandLogo.jsx';
import Molecular3D from '../../components/Molecular3D.jsx';

export default function LoginPage({ onLogin }) {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'register'
  const [role, setRole] = useState('qppv');
  const [email, setEmail] = useState('dr.elena.rostova@pharma-safety.org');
  const [password, setPassword] = useState('••••••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  function handleSubmit(e) {
    e.preventDefault();
    const roleNames = {
      qppv: 'QPPV / Qualified Person for Pharmacovigilance',
      safety_lead: 'Global Safety Lead / Medical Reviewer',
      regulatory: 'Regulatory Affairs Director (eCTD / IND)',
      data_science: 'Biostatistician & AI Pharmacometrics Lead',
    };

    onLogin({
      email: email || 'dr.elena.rostova@pharma-safety.org',
      role,
      name: email.includes('@') ? email.split('@')[0].replace('.', ' ') : 'Dr. Elena Rostova',
      title: roleNames[role] || 'Safety Specialist',
    });
  }

  function handleIBMSSO() {
    onLogin({
      email: 'dr.elena.rostova@ibm.pharmacovigilance.com',
      role: 'qppv',
      name: 'Dr. Elena Rostova',
      title: 'Enterprise QPPV Lead (watsonx.ai SSO)',
    });
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8f9ff] text-[#0b1c30] select-none">
      {/* ========================================================================= */}
      {/* LEFT HALF: Pharmaceutical Intelligence Arena & 3D Molecular Showcase    */}
      {/* ========================================================================= */}
      <section className="lg:w-7/12 w-full p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden bg-[#eff4ff] border-r border-[#c4c5d7]/30">
        {/* Top Bar: Official Brand Logo & High-Trust GxP Metadata */}
        <div className="z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <div className="h-7 w-[1px] bg-[#c4c5d7] hidden sm:block"></div>
            <span className="font-mono text-xs text-[#434655] font-medium tracking-tight">
              GxP Pharmacovigilance Suite v4.2
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full neu-surface-level-1 bg-[#f8f9ff]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span>
            <span className="font-mono text-[11px] text-[#004f35] font-semibold tracking-wide">
              FAERS &amp; EudraVigilance Sync: ACTIVE
            </span>
          </div>
        </div>

        {/* Center Hero Area: Tagline & 3D Molecular Shield Visualizer */}
        <div className="my-auto py-4 z-10 flex flex-col items-center text-center max-w-2xl mx-auto w-full">
          <div className="space-y-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5eeff] neu-well-inset text-[#0037b0] font-mono text-[11px] uppercase tracking-wider font-semibold">
              <span className="material-symbols-outlined text-[15px]">query_stats</span>
              Signal Detection &amp; Regulatory Submission
            </div>
            <h1 className="font-headline text-2xl lg:text-3xl font-bold text-[#0b1c30] tracking-tight leading-tight">
              Drug Safety Signal Detection &amp; Regulatory Submission Readiness
            </h1>
            <p className="font-body text-xs lg:text-sm text-[#434655] max-w-lg mx-auto">
              Autonomous post-marketing pharmacovigilance, PRR/ROR statistical surveillance, and watsonx.ai-driven eCTD regulatory compilation.
            </p>
          </div>

          {/* Interactive 3D Molecular Scene Container */}
          <div className="w-full relative rounded-2xl neu-well-inset bg-[#e5eeff]/40 p-2 my-2 overflow-hidden border border-white/50">
            {/* Top Info Badges inside 3D canvas */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg neu-surface-level-1 bg-[#f8f9ff]/90 text-[#0b1c30] font-mono text-xs backdrop-blur-sm">
              <span className="material-symbols-outlined text-[15px] text-[#0037b0]">view_in_ar</span>
              Lattice Ref: <span className="text-[#0037b0] font-bold">MOL-OXA-982</span>
            </div>

            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg neu-surface-level-1 bg-[#f8f9ff]/90 text-[#004f35] font-mono text-xs font-semibold backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#004f35]"></span>
              Stability: 99.98%
            </div>

            {/* Three.js 3D Molecular & Security Canvas Component */}
            <Molecular3D className="w-full h-[360px] lg:h-[400px]" />
          </div>

          {/* 3D Scene Interactive Instruction */}
          <p className="font-mono text-[11px] text-[#434655] flex items-center justify-center gap-1.5 mt-1">
            <span className="material-symbols-outlined text-[14px] text-[#0037b0]">touch_app</span>
            Interactive 3D Active Compound &amp; Signal Lattice • Drag/Move cursor to inspect molecular stability
          </p>
        </div>

        {/* Bottom: Enterprise Trust & Compliance Proof Badges */}
        <div className="z-10 pt-3 border-t border-[#c4c5d7]/30">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="neu-surface-level-1 bg-[#f8f9ff] rounded-xl p-2.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0037b0] text-[20px]">verified_user</span>
              <div>
                <p className="font-mono text-[11px] font-bold text-[#0b1c30] leading-tight">21 CFR Part 11</p>
                <p className="text-[10px] text-[#434655]">FDA Validated</p>
              </div>
            </div>

            <div className="neu-surface-level-1 bg-[#f8f9ff] rounded-xl p-2.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004f35] text-[20px]">health_and_safety</span>
              <div>
                <p className="font-mono text-[11px] font-bold text-[#0b1c30] leading-tight">GxP Compliant</p>
                <p className="text-[10px] text-[#434655]">Audit-Ready Cloud</p>
              </div>
            </div>

            <div className="neu-surface-level-1 bg-[#f8f9ff] rounded-xl p-2.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006398] text-[20px]">sync</span>
              <div>
                <p className="font-mono text-[11px] font-bold text-[#0b1c30] leading-tight">openFDA FAERS</p>
                <p className="text-[10px] text-[#434655]">Live Synchronized</p>
              </div>
            </div>

            <div className="neu-surface-level-1 bg-[#f8f9ff] rounded-xl p-2.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1d4ed8] text-[20px]">description</span>
              <div>
                <p className="font-mono text-[11px] font-bold text-[#0b1c30] leading-tight">ICH M4 eCTD</p>
                <p className="text-[10px] text-[#434655]">Certified Export</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* RIGHT HALF: Subtle Neumorphic Authentication Card                        */}
      {/* ========================================================================= */}
      <main className="lg:w-5/12 w-full p-6 lg:p-10 flex flex-col justify-center items-center relative bg-[#f8f9ff]">
        {/* Center Login Card */}
        <div className="w-full max-w-md bg-[#f8f9ff] rounded-2xl neu-surface-level-2 p-6 sm:p-8 flex flex-col relative z-10 border border-white/80">
          {/* Mode Switch: Segmented Tab Radios in Sunken Well */}
          <div className="w-full p-1 bg-[#e5eeff] rounded-xl neu-well-inset flex items-center justify-between mb-6">
            <button
              onClick={() => setAuthMode('signin')}
              className={`w-1/2 py-2 text-center text-sm font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-[#f8f9ff] text-[#0037b0] neu-btn-raised'
                  : 'text-[#434655] hover:text-[#0b1c30]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`w-1/2 py-2 text-center text-sm font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-[#f8f9ff] text-[#0037b0] neu-btn-raised'
                  : 'text-[#434655] hover:text-[#0b1c30]'
              }`}
            >
              Register / Request Access
            </button>
          </div>

          {/* Header Titles */}
          <div className="text-left mb-6">
            <h2 className="font-headline text-2xl font-bold text-[#0b1c30] tracking-tight mb-1">
              {authMode === 'signin' ? 'Welcome to DrugSafe AI' : 'Request Enterprise Access'}
            </h2>
            <p className="text-xs text-[#434655]">
              {authMode === 'signin'
                ? 'Drug Safety Intelligence Platform • Enterprise Pharmacovigilance'
                : 'Complete validation request for authorized clinical workspace access'}
            </p>
          </div>

          {/* Enterprise SSO Action: IBMid with watsonx.ai integration */}
          <div className="space-y-3 mb-4">
            <button
              type="button"
              onClick={handleIBMSSO}
              className="w-full py-2.5 px-4 rounded-xl neu-btn-raised bg-[#f8f9ff] hover:bg-[#eff4ff] flex items-center justify-between text-[#0b1c30] text-sm font-semibold border border-white cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#0062ff] text-[22px]">corporate_fare</span>
                <span>Continue with IBMid</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#e5eeff] text-[#0037b0] font-mono text-[10px] font-semibold">
                <span className="material-symbols-outlined text-[12px] text-[#0037b0]">neurology</span>
                watsonx.ai
              </div>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#c4c5d7]/50"></div>
              <span className="flex-shrink mx-3 font-mono text-[10px] text-[#434655] uppercase tracking-wider">
                or enterprise credentials
              </span>
              <div className="flex-grow border-t border-[#c4c5d7]/50"></div>
            </div>
          </div>

          {/* Authentication Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Conditional Field: Role Selection (Shown in Register Mode) */}
            {authMode === 'register' && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="block text-xs font-semibold text-[#0b1c30]" htmlFor="user-role">
                  Pharmacovigilance Role Designation
                </label>
                <div className="relative rounded-xl neu-well-inset bg-[#eff4ff]">
                  <select
                    id="user-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-transparent border-0 py-2.5 px-3 text-xs text-[#0b1c30] focus:ring-0 focus:outline-none cursor-pointer"
                  >
                    <option value="qppv">QPPV / Qualified Person for Pharmacovigilance</option>
                    <option value="safety_lead">Global Safety Lead / Medical Reviewer</option>
                    <option value="regulatory">Regulatory Affairs Director (eCTD / IND)</option>
                    <option value="data_science">Biostatistician &amp; AI Pharmacometrics Lead</option>
                  </select>
                </div>
              </div>
            )}

            {/* Work Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#0b1c30]" htmlFor="work-email">
                Enterprise Work Email
              </label>
              <div className="relative rounded-xl neu-well-inset bg-[#eff4ff] flex items-center focus-within:ring-1 focus-within:ring-[#1d4ed8]">
                <span className="pl-3 text-[#434655] flex items-center">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </span>
                <input
                  id="work-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., dr.elena.rostova@pharma-safety.org"
                  className="w-full bg-transparent border-0 py-2.5 px-3 text-xs text-[#0b1c30] placeholder:text-[#747686] focus:ring-0 focus:outline-none font-sans"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#0b1c30]" htmlFor="password">
                  Master Password
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-[#0037b0] hover:underline font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative rounded-xl neu-well-inset bg-[#eff4ff] flex items-center focus-within:ring-1 focus-within:ring-[#1d4ed8]">
                <span className="pl-3 text-[#434655] flex items-center">
                  <span className="material-symbols-outlined text-[18px]">key</span>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full bg-transparent border-0 py-2.5 px-3 text-xs text-[#0b1c30] placeholder:text-[#747686] focus:ring-0 focus:outline-none font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-3 text-[#434655] hover:text-[#0b1c30] flex items-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* GxP Session Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember-workstation"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 text-[#1d4ed8] rounded border-[#747686] focus:ring-[#0037b0] cursor-pointer"
              />
              <label htmlFor="remember-workstation" className="text-xs text-[#434655] cursor-pointer select-none">
                Remember this workstation (GxP Compliant 12h Session)
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl neu-btn-primary text-white text-sm font-semibold flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <span>
                {authMode === 'signin'
                  ? 'Sign In to Safety Intelligence'
                  : 'Submit Access Authorization Request'}
              </span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          {/* Access note & Admin switch */}
          <div className="text-center mt-6 pt-4 border-t border-[#c4c5d7]/30">
            <p className="text-xs text-[#434655]">
              {authMode === 'signin' ? (
                <>
                  Don't have an enterprise account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-[#0037b0] font-semibold hover:underline ml-1 cursor-pointer"
                  >
                    Request Access from Pharmacovigilance Admin
                  </button>
                </>
              ) : (
                <>
                  Already authorized under institutional protocol?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="text-[#0037b0] font-semibold hover:underline ml-1 cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Trust and Security Compliance Notice (Strict 21 CFR Part 11) */}
        <div className="mt-6 max-w-md text-center flex items-center justify-center gap-2 text-[#434655]">
          <span className="material-symbols-outlined text-[#0037b0] text-[18px] shrink-0">lock</span>
          <p className="font-mono text-[10px] leading-normal text-left">
            Secure access restricted to authorized pharmacovigilance, medical review, and regulatory teams under 21 CFR Part 11 protocol. All logins are cryptographically logged.
          </p>
        </div>
      </main>
    </div>
  );
}
