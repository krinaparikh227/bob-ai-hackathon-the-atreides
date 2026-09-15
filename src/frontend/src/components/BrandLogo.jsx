/* ── DrugSafe AI Official Brand Logo ──
 * Matches: stitch_drugsafe_ai_ui_prototype/drugsafe_ai_brand_logo/code.html
 */
export default function BrandLogo({ className = 'h-10 w-auto', showText = true, textVariant = 'full' }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Clinical Shield SVG Icon */}
      <svg
        className="h-10 w-10 shrink-0"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#subtle-glow-brand)">
          <rect x="6" y="6" width="52" height="52" rx="14" fill="#F0F4F8" />
          <path
            d="M32 15L46 21.5V33C46 41.5 39.5 49 32 51C24.5 49 18 41.5 18 33V21.5L32 15Z"
            fill="url(#brand_grad_spec)"
            stroke="#1D4ED8"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="28" r="4" fill="#FFFFFF" />
          <path
            d="M32 32.5V42M27 37.5H37"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
        <defs>
          <linearGradient id="brand_grad_spec" x1="18" y1="15" x2="46" y2="51" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" />
            <stop offset="1" stopColor="#1E40AF" />
          </linearGradient>
          <filter id="subtle-glow-brand" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#94A3B8" floodOpacity="0.25" />
            <feDropShadow dx="-2" dy="-2" stdDeviation="3" floodColor="#FFFFFF" floodOpacity="0.85" />
          </filter>
        </defs>
      </svg>

      {showText && (
        <div className="flex flex-col justify-center text-left">
          <div className="font-headline font-bold text-xl leading-none text-on-surface tracking-tight">
            DrugSafe<span className="text-primary-container font-extrabold text-blue-600">AI</span>
          </div>
          {textVariant === 'full' && (
            <span className="font-mono text-[9px] uppercase tracking-wider text-outline font-semibold mt-0.5">
              Safety &amp; Regulatory Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
}
