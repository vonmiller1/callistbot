import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Users, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  ExternalLink,
  CheckCircle2,
  CalendarCheck,
  ListFilter
} from 'lucide-react';
import { Meeting } from '../types';

interface DashboardProps {
  meetings: Meeting[];
  selectedMeetingId: string;
  onSelectMeeting: (id: string) => void;
  onOpenDetails: (meeting: Meeting) => void;
  onOpenSchedule: () => void;
  onOpenAssistant: (query: string) => void;
  searchQuery: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  meetings,
  selectedMeetingId,
  onSelectMeeting,
  onOpenDetails,
  onOpenSchedule,
  onOpenAssistant,
  searchQuery,
}) => {
  const [filterMode, setFilterMode] = useState<'upcoming' | 'today' | 'recent' | 'all'>('upcoming');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter meetings by search query and category
  const filtered = meetings.filter((m) => {
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.participants.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.email.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === 'today') {
      return m.date === todayStr;
    }
    if (filterMode === 'upcoming') {
      return m.date >= todayStr && m.status !== 'cancelled';
    }
    if (filterMode === 'recent') {
      return m.date < todayStr || m.status === 'cancelled';
    }
    return true;
  });

  const todayMeetings = meetings.filter((m) => m.date === todayStr && m.status !== 'cancelled');
  const upcomingMeetings = meetings.filter((m) => m.date >= todayStr && m.status !== 'cancelled');
  const recentMeetings = meetings.filter((m) => m.date < todayStr || m.status === 'cancelled');
  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId) || filtered[0] || meetings[0];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Summary Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50/40 border border-indigo-100 rounded-3xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                Workspace Dashboard
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Calendar Background Sync Active ✓
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Stay Prepared for Every High-Impact Meeting
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Calist synthesizes your calendar appointments, agendas, and stakeholder habits into quick 1-page briefs so you're always ready.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenSchedule}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Meeting</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-indigo-100/60">
          <span className="text-[11px] font-semibold text-slate-500">Filter View:</span>
          {(
            [
              { key: 'upcoming', label: 'Upcoming Meetings', count: upcomingMeetings.length },
              { key: 'today', label: "Today's Meetings", count: todayMeetings.length },
              { key: 'recent', label: 'Recent Meetings', count: recentMeetings.length },
              { key: 'all', label: 'All Meetings', count: meetings.length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterMode(tab.key)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterMode === tab.key
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-indigo-50/70 border border-slate-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Meeting Cards on Left, Pre-Meeting Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Meetings Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-indigo-600" />
                <span>
                  {filterMode === 'upcoming'
                    ? 'Upcoming Meetings'
                    : filterMode === 'today'
                    ? "Today's Meetings"
                    : filterMode === 'recent'
                    ? 'Recent Meetings'
                    : 'Scheduled Meetings'}
                </span>
              </h2>
              <span className="text-[11px] font-semibold text-slate-500">
                {filtered.length} found
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200/80">
                <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-sm">
                  {filterMode === 'today'
                    ? "No meetings scheduled for today"
                    : filterMode === 'recent'
                    ? "No recent meetings"
                    : "No upcoming meetings"}
                </p>
                <p className="text-slate-500 mt-1">
                  {filterMode === 'recent'
                    ? "Completed or cancelled meetings will be archived here."
                    : "Schedule your first meeting to get started."}
                </p>
                <button
                  onClick={onOpenSchedule}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
                >
                  Schedule Meeting
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map((m) => {
                  const isSelected = m.id === selectedMeeting?.id;
                  const isCancelled = m.status === 'cancelled';

                  return (
                    <div
                      key={m.id}
                      onClick={() => onSelectMeeting(m.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                          : isCancelled
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:bg-slate-50/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{m.date === todayStr ? 'Today' : m.date} at {m.startTime}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCancelled ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {m.platform}
                        </span>
                      </div>

                      <h3 className={`text-sm font-bold mb-2 line-clamp-1 ${
                        isCancelled ? 'line-through text-slate-500' : isSelected ? 'text-indigo-950 font-bold' : 'text-slate-900'
                      }`}>
                        {m.title}
                      </h3>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex -space-x-1.5">
                          {m.participants.slice(0, 3).map((att) => (
                            <img
                              key={att.id}
                              src={att.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'}
                              alt={att.name}
                              title={`${att.name} (${att.role || 'Participant'})`}
                              className="w-6 h-6 rounded-full border-2 border-white object-cover"
                            />
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDetails(m);
                            }}
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            Details &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pre-Meeting Dossier Brief */}
        <div className="lg:col-span-7 space-y-4">
          {selectedMeeting ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Pre-Meeting Intelligence
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {selectedMeeting.durationMinutes} min sync
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedMeeting.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenDetails(selectedMeeting)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                  >
                    View Details
                  </button>
                  {selectedMeeting.meetingLink && (
                    <a
                      href={selectedMeeting.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shadow-xs"
                    >
                      <span>Join</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Brief Content */}
              {selectedMeeting.brief ? (
                <div className="space-y-4 text-xs">
                  {/* Executive Summary */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                    <h3 className="font-bold text-slate-800 text-xs mb-1">
                      Summary & Objective
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {selectedMeeting.brief.executiveSummary}
                    </p>
                  </div>

                  {/* Talking points */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                    <h3 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Recommended Talking Points</span>
                    </h3>
                    <ul className="space-y-1.5 text-slate-700">
                      {selectedMeeting.brief.talkingPoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-indigo-600 font-bold shrink-0">{i + 1}.</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key attendees */}
                  {selectedMeeting.participants.length > 0 && (
                    <div>
                      <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Meeting Attendees</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedMeeting.participants.map((p) => (
                          <div key={p.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              {p.name.charAt(0) || 'P'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-900 truncate">{p.name || p.email}</p>
                              <p className="text-[10px] text-slate-500 truncate">{p.role || p.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ask assistant CTA */}
                  <div className="pt-2">
                    <button
                      onClick={() => onOpenAssistant(`Prepare me for my upcoming call on "${selectedMeeting.title}"`)}
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 text-indigo-800 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-2xs"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Ask Calist AI for Live Prep Strategy</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500">
                  <p>Brief will be synthesized before the meeting starts.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl text-xs text-slate-400">
              Select a meeting on the left to see the Pre-Meeting Brief.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
