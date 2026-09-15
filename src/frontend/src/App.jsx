import { useState } from 'react';
import LoginPage from './pages/Auth/LoginPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import SafetyNotice from './components/SafetyNotice.jsx';
import Dashboard from './pages/Dashboard/index.jsx';
import SignalDetection from './pages/SignalDetection/index.jsx';
import SubmissionReadiness from './pages/SubmissionReadiness/index.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [chatOpen, setChatOpen] = useState(false);

  // If not logged in, render the Enterprise Login / Access Portal
  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'signal':
        return <SignalDetection onNavigate={setActivePage} onOpenChat={() => setChatOpen(true)} />;
      case 'dossier':
        return <SubmissionReadiness onNavigate={setActivePage} onOpenChat={() => setChatOpen(true)} />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={setActivePage} onOpenChat={() => setChatOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-on-surface antialiased">
      {/* Fixed Sidebar Navigation Rail */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main Content Wrapper (offset by sidebar width) */}
      <div className="pl-64 flex flex-col min-h-screen">
        {/* Sticky Top Navigation Bar */}
        <TopBar
          user={user}
          onSignOut={() => setUser(null)}
          onToggleChat={() => setChatOpen(o => !o)}
          chatOpen={chatOpen}
        />

        {/* Main Workspace Canvas */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 p-5 lg:p-8 bg-[#EEF3F8] overflow-y-auto">
            <div className="max-w-[1920px] w-full mx-auto space-y-5">
              {/* Mandatory Regulatory & Clinical Safety Guardrail */}
              <SafetyNotice />

              {/* Active Workspace View */}
              {renderPage()}
            </div>

            {/* Footer */}
            <footer className="py-6 mt-8 text-center text-[11px] text-outline font-mono">
              DrugSafe AI &mdash; Enterprise Pharmacovigilance &amp; Regulatory Intelligence &mdash; 21 CFR Part 11 Validated
            </footer>
          </main>

          {/* Chat sidebar (from right) */}
          {chatOpen && (
            <aside className="w-80 xl:w-96 flex-shrink-0 overflow-hidden flex flex-col mr-4 my-4">
              <div className="card flex-1 flex flex-col overflow-hidden">
                <ChatPanel onClose={() => setChatOpen(false)} currentMode={activePage === 'signal' ? 'signal' : 'dossier'} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
