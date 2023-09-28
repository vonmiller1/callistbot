import React, { useState } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video, 
  UserPlus, 
  Trash2, 
  Bell, 
  Check, 
  Sparkles,
  Link,
  Users
} from 'lucide-react';
import { Meeting, Participant, MeetingReminder } from '../types';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (meetingData: Partial<Meeting>) => Promise<void>;
  userTimezone: string;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
  userTimezone,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [agenda, setAgenda] = useState('');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('14:30');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [platform, setPlatform] = useState<'Google Meet' | 'Microsoft Teams' | 'Zoom' | 'In-Person'>('Google Meet');
  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('Virtual');
  
  // Participants
  const [participants, setParticipants] = useState<{ name: string; email: string; role?: string }[]>([
    { name: '', email: '' },
  ]);

  // Options
  const [reminderTime, setReminderTime] = useState<number>(15);
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [confirmedMeeting, setConfirmedMeeting] = useState<Meeting | null>(null);

  if (!isOpen) return null;

  const handleAddParticipant = () => {
    setParticipants((prev) => [...prev, { name: '', email: '' }]);
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleParticipantChange = (index: number, field: 'name' | 'email', value: string) => {
    setParticipants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !startTime) return;

    setIsLoading(true);
    try {
      const validParticipants: Participant[] = participants
        .filter((p) => p.email.trim())
        .map((p, idx) => ({
          id: `p-${Date.now()}-${idx}`,
          name: p.name.trim() || p.email.split('@')[0],
          email: p.email.trim(),
          role: 'Attendee',
          responseStatus: 'invited',
          avatar: `https://images.unsplash.com/photo-${1500000000000 + (idx * 50000)}?w=160&auto=format&fit=crop&q=80`,
        }));

      const reminder: MeetingReminder = {
        enabled: true,
        timeBeforeMinutes: reminderTime,
        label: `${reminderTime} minutes before`,
      };

      const meetingData: Partial<Meeting> = {
        title: title.trim(),
        description: description.trim(),
        agenda: agenda.trim(),
        date,
        startTime,
        endTime,
        timezone: userTimezone || 'America/New_York (EST)',
        durationMinutes,
        platform,
        meetingLink: meetingLink.trim() || (platform === 'Zoom' ? 'https://zoom.us/j/8492019381' : 'https://meet.google.com/cal-auto-sync'),
        location: location.trim(),
        recurring,
        reminder,
        notes: notes.trim(),
        participants: validParticipants,
      };

      await onSchedule(meetingData);
      
      // Show Confirmation Card
      setConfirmedMeeting(meetingData as Meeting);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {confirmedMeeting ? 'Meeting Confirmed!' : 'Schedule a Meeting'}
              </h2>
              <p className="text-xs text-slate-500">
                {confirmedMeeting ? 'Your meeting is scheduled and synced.' : 'Invites will be sent and background calendar sync updated.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {confirmedMeeting ? (
          <div className="p-8 text-center space-y-5 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                "{confirmedMeeting.title}"
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Scheduled for <strong className="text-slate-700">{confirmedMeeting.date}</strong> at <strong className="text-slate-700">{confirmedMeeting.startTime}</strong> ({confirmedMeeting.durationMinutes} mins)
              </p>
            </div>

            {/* Confirmation Dossier Summary */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-left text-xs space-y-2.5 max-w-lg mx-auto">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Platform & Link:</span>
                <span className="font-semibold text-indigo-600">{confirmedMeeting.platform} ({confirmedMeeting.meetingLink})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Participants:</span>
                <span className="font-semibold text-slate-800">
                  {confirmedMeeting.participants.length > 0
                    ? confirmedMeeting.participants.map((p) => p.name || p.email).join(', ')
                    : 'Organizer only'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Reminder Set:</span>
                <span className="font-semibold text-emerald-600">{confirmedMeeting.reminder?.label}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Background Sync:</span>
                <span className="font-semibold text-slate-700">Google & Outlook Calendar updated ✓</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                Done & View on Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            {/* Title & Agenda */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Meeting Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q4 Executive Strategy & Product Alignment"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Description / Context
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short summary for attendees"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Agenda Items
                </label>
                <input
                  type="text"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Key discussion points"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Duration
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
            </div>

            {/* Platform & Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
                >
                  <option value="Google Meet">Google Meet</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="Zoom">Zoom</option>
                  <option value="In-Person">In-Person</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Meeting Link / Room
                </label>
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
                />
              </div>
            </div>

            {/* Participants */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Participants & Attendees</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Another</span>
                </button>
              </div>

              <div className="space-y-2">
                {participants.map((part, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={part.name}
                      onChange={(e) => handleParticipantChange(idx, 'name', e.target.value)}
                      placeholder="Name (e.g. Sarah Jenkins)"
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="email"
                      value={part.email}
                      onChange={(e) => handleParticipantChange(idx, 'email', e.target.value)}
                      placeholder="Email (e.g. sarah@vantage.com)"
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    {participants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reminder & Recurring */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>Meeting Reminder</span>
                </label>
                <select
                  value={reminderTime}
                  onChange={(e) => setReminderTime(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
                >
                  <option value={5}>5 minutes before</option>
                  <option value={10}>10 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Repeat / Recurring
                </label>
                <select
                  value={recurring}
                  onChange={(e) => setRecurring(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Every day</option>
                  <option value="weekly">Weekly on this day</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Scheduling & Syncing...' : 'Schedule Meeting'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
