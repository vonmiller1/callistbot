/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AssistantChatPane } from './components/AssistantChatPane';
import { ContactHabitsView } from './components/ContactHabitsView';
import { AuthModal } from './components/AuthModal';
import { ScheduleMeetingModal } from './components/ScheduleMeetingModal';
import { MeetingDetailsModal } from './components/MeetingDetailsModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { NotificationsDropdown } from './components/NotificationsDropdown';
import { api } from './services/api';
import { exportSimpleZip, triggerDownload } from './services/zipExporter';
import { UserProfile, Meeting, AppNotification, CalendarIntegration } from './types';
import { MOCK_CONTACTS } from './data/mockWorkspace';
import { Sparkles } from 'lucide-react';

export default function App() {
  // Authentication & User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'meetings' | 'assistant' | 'people'>('meetings');
  const [searchQuery, setSearchQuery] = useState('');

  // Core Data
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [calendarIntegrations, setCalendarIntegrations] = useState<CalendarIntegration[]>([]);

  // Modals & Panels
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [inspectingMeeting, setInspectingMeeting] = useState<Meeting | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Assistant query passing
  const [assistantInitialQuery, setAssistantInitialQuery] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load user session on mount
  useEffect(() => {
    async function initUser() {
      try {
        const token = api.getToken();
        if (token) {
          const res = await api.getCurrentUser();
          setCurrentUser(res.user);
          loadDashboardData();
        }
      } catch (e) {
        console.warn('Init error, please log in:', e);
        api.clearToken();
      } finally {
        setIsAuthLoading(false);
      }
    }
    initUser();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [mtgRes, notifRes, calRes] = await Promise.all([
        api.getMeetings(),
        api.getNotifications(),
        api.getCalendarIntegrations(),
      ]);

      setMeetings(mtgRes.meetings);
      if (mtgRes.meetings.length > 0 && !selectedMeetingId) {
        setSelectedMeetingId(mtgRes.meetings[0].id);
      }
      setNotifications(notifRes.notifications);
      setCalendarIntegrations(calRes.integrations);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  // Auth Handlers
  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    loadDashboardData();
    showToast(`Welcome, ${user.name}!`);
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setMeetings([]);
    setNotifications([]);
    showToast('Logged out safely.');
  };

  // Profile update handler
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    const res = await api.updateProfile(updates);
    setCurrentUser(res.profile);
    showToast('Personal profile saved!');
  };

  // Meeting Schedule handler
  const handleScheduleMeeting = async (meetingData: Partial<Meeting>) => {
    const res = await api.createMeeting(meetingData);
    setMeetings((prev) => [res.meeting, ...prev]);
    setSelectedMeetingId(res.meeting.id);
    // Reload notifications
    const notifs = await api.getNotifications();
    setNotifications(notifs.notifications);
    showToast(`Scheduled "${res.meeting.title}"!`);
  };

  // Update notes handler
  const handleUpdateNotes = async (meetingId: string, notes: string) => {
    const res = await api.updateMeeting(meetingId, { notes });
    setMeetings((prev) => prev.map((m) => (m.id === meetingId ? res.meeting : m)));
    showToast('Meeting notes saved.');
  };

  // Cancel meeting handler
  const handleCancelMeeting = async (meetingId: string) => {
    await api.cancelMeeting(meetingId);
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, status: 'cancelled' } : m))
    );
    const notifs = await api.getNotifications();
    setNotifications(notifs.notifications);
    showToast('Meeting has been cancelled.');
  };

  // Notifications Handlers
  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readStatus: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
    showToast('All notifications marked as read.');
  };

  const handleClearNotifications = async () => {
    await api.clearNotifications();
    setNotifications([]);
    showToast('Notifications cleared.');
  };

  // Calendar Sync Handlers
  const handleConnectCalendar = async (provider: 'google' | 'microsoft') => {
    const res = await api.connectCalendar(provider);
    const calRes = await api.getCalendarIntegrations();
    setCalendarIntegrations(calRes.integrations);
    showToast(res.message);
  };

  const handleDisconnectCalendar = async (provider: 'google' | 'microsoft') => {
    const res = await api.disconnectCalendar(provider);
    const calRes = await api.getCalendarIntegrations();
    setCalendarIntegrations(calRes.integrations);
    showToast(res.message);
  };

  const handleSyncCalendarNow = async () => {
    const res = await api.syncCalendarNow();
    await loadDashboardData();
    showToast(res.message);
  };

  // Open Assistant with quick query
  const handleOpenAssistantWithQuery = (query: string) => {
    setAssistantInitialQuery(query);
    setActiveTab('assistant');
  };

  // Export full zip
  const handleDownloadZip = async () => {
    try {
      showToast('Packaging full-stack Calist archive with Auth, Profile, and Calendar sync...');
      const blob = await exportSimpleZip();
      triggerDownload(blob, 'calist-meeting-prep-agent.zip');
      showToast('Download initiated: calist-meeting-prep-agent.zip');
    } catch (e) {
      console.error(e);
      showToast('Failed to build zip.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSchedule={() => setIsScheduleOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        onDownloadZip={handleDownloadZip}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        isNotificationsOpen={isNotificationsOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 relative">
        {/* Notifications Dropdown Drawer */}
        <NotificationsDropdown
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onClearAll={handleClearNotifications}
          onSelectMeeting={(mId) => {
            if (mId) {
              setSelectedMeetingId(mId);
              setActiveTab('meetings');
            }
          }}
        />

        {activeTab === 'meetings' && (
          <Dashboard
            meetings={meetings}
            selectedMeetingId={selectedMeetingId}
            onSelectMeeting={setSelectedMeetingId}
            onOpenDetails={(m) => setInspectingMeeting(m)}
            onOpenSchedule={() => setIsScheduleOpen(true)}
            onOpenAssistant={handleOpenAssistantWithQuery}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'assistant' && (
          <AssistantChatPane initialQuery={assistantInitialQuery} />
        )}

        {activeTab === 'people' && (
          <ContactHabitsView
            contacts={MOCK_CONTACTS}
            onAskAboutContact={(name) =>
              handleOpenAssistantWithQuery(`Analyze ${name}'s meeting habits and prep strategy`)
            }
          />
        )}
      </main>

      {/* Modals */}
      {!currentUser && !isAuthLoading && (
        <AuthModal onSuccess={handleAuthSuccess} />
      )}

      <ScheduleMeetingModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSchedule={handleScheduleMeeting}
        userTimezone={currentUser?.timezone || 'America/New_York (EST)'}
      />

      <MeetingDetailsModal
        meeting={inspectingMeeting}
        onClose={() => setInspectingMeeting(null)}
        onUpdateNotes={handleUpdateNotes}
        onCancelMeeting={handleCancelMeeting}
        onOpenAssistant={handleOpenAssistantWithQuery}
      />

      {currentUser && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={currentUser}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {currentUser && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          user={currentUser}
          integrations={calendarIntegrations}
          onConnectCalendar={handleConnectCalendar}
          onDisconnectCalendar={handleDisconnectCalendar}
          onSyncCalendarNow={handleSyncCalendarNow}
          onLogout={handleLogout}
          onOpenEditProfile={() => setIsProfileOpen(true)}
        />
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
