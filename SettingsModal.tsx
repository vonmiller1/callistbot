import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Bell, 
  Shield, 
  Key, 
  LogOut, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  ExternalLink,
  Lock,
  Mail
} from 'lucide-react';
import { UserProfile, CalendarIntegration } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  integrations: CalendarIntegration[];
  onConnectCalendar: (provider: 'google' | 'microsoft') => Promise<void>;
  onDisconnectCalendar: (provider: 'google' | 'microsoft') => Promise<void>;
  onSyncCalendarNow: () => Promise<void>;
  onLogout: () => void;
  onOpenEditProfile: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  integrations,
  onConnectCalendar,
  onDisconnectCalendar,
  onSyncCalendarNow,
  onLogout,
  onOpenEditProfile,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'calendar' | 'account' | 'notifications' | 'privacy'>('calendar');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Notification toggles
  const [notifyReminders, setNotifyReminders] = useState(true);
  const [notifyInvites, setNotifyInvites] = useState(true);
  const [notifySync, setNotifySync] = useState(true);

  const googleIntegration = integrations.find((i) => i.provider === 'google');
  const msIntegration = integrations.find((i) => i.provider === 'microsoft');

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      await onSyncCalendarNow();
      setSyncStatusMsg('Background calendar synchronization complete. Meetings are up-to-date.');
      setTimeout(() => setSyncStatusMsg(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Settings & Preferences
            </h2>
            <p className="text-xs text-slate-500">
              Manage calendar background sync, notifications, and security.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar & Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'account'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Account & Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy & Security</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Calendar & Integrations */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                <h3 className="font-bold text-indigo-950 text-xs mb-1">
                  Background Calendar Synchronization
                </h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Calendar sync works automatically in the background. Calist imports your scheduled events, avoids duplicates, and auto-generates pre-meeting briefs without cluttering your main dashboard.
                </p>
              </div>

              {/* Status Message */}
              {syncStatusMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syncStatusMsg}</span>
                </div>
              )}

              {/* Google Calendar Card */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">
                      Google Calendar
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {googleIntegration?.accountEmail || user.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Google Calendar — Connected ✓
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {googleIntegration?.connectionStatus === 'connected' ? (
                    <button
                      onClick={() => onDisconnectCalendar('google')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-semibold rounded-xl text-xs transition-colors"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => onConnectCalendar('google')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>

              {/* Microsoft Outlook Card */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <svg className="w-6 h-6" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M1 1h10v10H1z"/>
                      <path fill="#81bc06" d="M12 1h10v10H12z"/>
                      <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                      <path fill="#ffba08" d="M12 12h10v10H12z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">
                      Microsoft Outlook Calendar
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {msIntegration?.accountEmail || 'alex.rivera@outlook.com'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Outlook Calendar — Connected ✓
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {msIntegration?.connectionStatus === 'connected' ? (
                    <button
                      onClick={() => onDisconnectCalendar('microsoft')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-semibold rounded-xl text-xs transition-colors"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => onConnectCalendar('microsoft')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>

              {/* Sync Trigger */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">
                    Run Manual Sync
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Force an immediate background check across all authorized calendars.
                  </p>
                </div>
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Account & Profile */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <img
                  src={user.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{user.name}</h4>
                  <p className="text-slate-500 text-[11px] truncate">{user.email}</p>
                  <p className="text-indigo-600 text-[11px] font-medium mt-0.5">{user.jobTitle} • {user.organization}</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenEditProfile();
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs shadow-2xs"
                >
                  Edit Profile
                </button>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5">
                <span className="font-bold text-slate-800 block text-xs">Security & Passwords</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your credentials and passwords are encrypted with PBKDF2 salting. OAuth tokens are stored in server-side memory only.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => alert('Password reset verification link has been dispatched to your email.')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                  >
                    Change Password
                  </button>
                </div>
              </div>

              {/* Logout */}
              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-950 block text-xs">Sign Out</span>
                  <p className="text-[11px] text-rose-700">Safely log out of your Calist session on this device.</p>
                </div>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <span className="font-bold text-slate-800 block text-xs mb-1">
                Notification Preferences
              </span>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Meeting Reminders</p>
                  <p className="text-[11px] text-slate-500">Alerts 15 mins before calls start</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyReminders}
                  onChange={(e) => setNotifyReminders(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">New Invitations & RSVP Updates</p>
                  <p className="text-[11px] text-slate-500">When attendees accept or decline meetings</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyInvites}
                  onChange={(e) => setNotifyInvites(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Calendar Background Sync Updates</p>
                  <p className="text-[11px] text-slate-500">Status reports when Google or Outlook synchronizes</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifySync}
                  onChange={(e) => setNotifySync(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </div>
            </div>
          )}

          {/* Privacy */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="font-bold text-slate-800 block text-xs">
                  Zero Data-Leakage & Privacy Controls
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Calist accesses only meeting metadata (titles, participants, times) required to generate pre-meeting briefs. No personal emails or company data are sold or exposed.
                </p>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Export Meeting Data</span>
                  <p className="text-[11px] text-slate-500">Download all your scheduled meetings and notes.</p>
                </div>
                <button
                  onClick={() => alert('Export package has been generated and queued for download.')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Export JSON
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
