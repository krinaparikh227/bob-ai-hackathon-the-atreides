import BrandLogo from './BrandLogo.jsx';

export default function TopBar({ user, onSignOut, onToggleChat, chatOpen }) {
  return (
    <header className="flex justify-between items-center w-full px-6 h-16 sticky top-0 z-40 bg-[#f8f9ff] border-b border-[#c4c5d7]/40 shadow-sm">
      {/* Left search bar cluster */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full">
          <div className="neu-well-inset flex items-center px-3 py-2 rounded-xl bg-[#eff4ff] w-full text-[#434655] focus-within:ring-1 focus-within:ring-[#1d4ed8]">
            <span className="material-symbols-outlined text-[#747686] mr-2 text-lg">search</span>
            <input
              className="bg-transparent border-none outline-none text-xs w-full text-[#0b1c30] placeholder:text-[#747686]/80 focus:ring-0 p-0 font-sans"
              placeholder="Search MedDRA PT, LLT, CAS RN, or Active Moieties..."
              type="text"
            />
            <span className="text-[10px] font-mono text-[#747686] border border-[#c4c5d7]/50 px-1.5 py-0.5 rounded bg-[#f8f9ff]">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      {/* Center Brand Logo display */}
      <div className="hidden md:flex items-center">
        <BrandLogo showText={true} textVariant="short" className="h-8" />
      </div>

      {/* Right cluster actions */}
      <div className="flex items-center gap-3">
        {/* Watsonx AI Action Button */}
        <button
          onClick={onToggleChat}
          className={`neu-raised-card hover:bg-surface-container transition-all duration-150 active:scale-[0.98] py-1.5 px-3 rounded-lg flex items-center gap-2 bg-surface-container-low border ${chatOpen ? 'border-primary ring-1 ring-primary/30' : 'border-primary/20'}`}
        >
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xs">smart_toy</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-primary font-headline">IBM Bob</span>
            <span className="text-[10px] font-mono text-secondary -mt-0.5 font-medium">watsonx.ai</span>
          </div>
          <span className="material-symbols-outlined text-xs text-primary ml-1">auto_awesome</span>
        </button>

        {/* Icon Actions */}
        <div className="flex items-center gap-2">
          <button
            aria-label="Notifications"
            className="p-2 rounded-lg neu-raised-card hover:bg-surface-container transition-colors active:scale-[0.98] relative text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-lg">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error"></span>
          </button>
          <button
            aria-label="Filter Tuning"
            className="p-2 rounded-lg neu-raised-card hover:bg-surface-container transition-colors active:scale-[0.98] text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-lg">tune</span>
          </button>
        </div>

        <div className="h-6 w-px bg-outline-variant/40"></div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 neu-raised-card px-2.5 py-1.5 rounded-lg bg-surface-container-lowest">
          <div
            className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs font-headline"
            title="Chief Safety Officer Avatar"
          >
            CSO
          </div>
          <div className="hidden lg:flex flex-col text-left leading-none">
            <span className="text-xs font-semibold text-on-surface font-headline">{user?.name || 'Dr. Elena Rostova'}</span>
            <span className="text-[10px] font-mono text-outline">{user?.title || 'QPPV / Safety Lead'}</span>
          </div>
          <button
            onClick={onSignOut}
            title="Sign Out"
            className="p-1 rounded hover:bg-surface-container text-outline hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>
      </div>
    </header>
  );
}
