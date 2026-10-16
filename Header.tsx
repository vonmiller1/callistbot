import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  MessageSquare, 
  Users, 
  Download, 
  Bell, 
  Search, 
  Plus, 
  Settings, 
  LogOut, 
  Check, 
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { UserProfile, AppNotification } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  activeTab: 'meetings' | 'assistant' | 'people';
  setActiveTab: (tab: 'meetings' | 'assistant' | 'people') => void;
  onOpenSchedule: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  onDownloadZip: () => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  isNotificationsOpen: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenSchedule,
  onOpenSettings,
  onOpenProfile,
  onLogout,
  onDownloadZip,
  notifications,
  onOpenNotifications,
  isNotificationsOpen,
  searchQuery,
  setSearchQuery,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('meetings')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Calist
                </span>
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 hidden sm:inline">
                  Meeting Prep
                </span>
              </div>
            </button>
          </div>

          {/* Search Box in Header */}
          <div className="hidden md:flex items-center relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings, people, or notes..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70 text-xs">
            <button
              onClick={() => setActiveTab('meetings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'meetings'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Meetings</span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'assistant'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Assistant</span>
              <span className="sm:hidden">AI</span>
            </button>

            <button
              onClick={() => setActiveTab('people')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'people'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>People</span>
            </button>
          </nav>

          {/* Right Header CTAs & Profile Menu */}
          <div className="flex items-center gap-2 relative">
            {/* Schedule Meeting CTA */}
            <button
              onClick={onOpenSchedule}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Schedule Meeting</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
              )}
            </button>

            {/* Download Zip */}
            <button
              onClick={onDownloadZip}
              title="Download Upgraded Project ZIP"
              className="hidden lg:flex items-center gap-1 p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl text-xs transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Profile Picture & Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <img
                    src={user.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div 
                    className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit Personal Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Settings & Calendar Sync</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onDownloadZip();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Export Project .ZIP</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
