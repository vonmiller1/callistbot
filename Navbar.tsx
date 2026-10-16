import React from 'react';
import { 
  Sparkles, 
  Calendar, 
  MessageSquare, 
  Link2, 
  Users, 
  Download, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'meetings' | 'assistant' | 'people' | 'integrations';
  setActiveTab: (tab: 'meetings' | 'assistant' | 'people' | 'integrations') => void;
  onDownloadZip: () => void;
  onSyncAll: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onDownloadZip,
  onSyncAll,
  isSyncing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-800 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <button 
            onClick={() => setActiveTab('meetings')}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-500 p-0.5 shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Calist
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-full">
                  Meeting Prep
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Simple intelligence for busy professionals
              </p>
            </div>
          </button>

          {/* Navigation Tabs - Simple and clear for everyday working people */}
          <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setActiveTab('meetings')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'meetings'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>My Meetings</span>
              <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-full text-[10px]">
                2
              </span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'assistant'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('people')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'people'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>People & Habits</span>
            </button>

            <button
              onClick={() => setActiveTab('integrations')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'integrations'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Connected Tools</span>
            </button>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSyncAll}
              disabled={isSyncing}
              title="Refresh and sync latest updates from your calendar and emails"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Calendar'}</span>
            </button>

            <button
              onClick={onDownloadZip}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-200 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
