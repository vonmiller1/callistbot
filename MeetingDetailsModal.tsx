import React, { useState } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  MapPin, 
  Users, 
  Bell, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Check, 
  Sparkles,
  ListTodo,
  Share2
} from 'lucide-react';
import { Meeting } from '../types';

interface MeetingDetailsModalProps {
  meeting: Meeting | null;
  onClose: () => void;
  onUpdateNotes: (meetingId: string, notes: string) => Promise<void>;
  onCancelMeeting: (meetingId: string) => Promise<void>;
  onOpenAssistant: (query: string) => void;
}

export const MeetingDetailsModal: React.FC<MeetingDetailsModalProps> = ({
  meeting,
  onClose,
  onUpdateNotes,
  onCancelMeeting,
  onOpenAssistant,
}) => {
  if (!meeting) return null;

  const [notes, setNotes] = useState(meeting.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await onUpdateNotes(meeting.id, notes);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancelMeeting(meeting.id);
      onClose();
    } finally {
      setIsCancelling(false);
      setShowConfirmCancel(false);
    }
  };

  const isCancelled = meeting.status === 'cancelled';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-white border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isCancelled ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {meeting.status}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <Video className="w-3.5 h-3.5 text-indigo-600" />
                {meeting.platform}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {meeting.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Quick Date, Time & Link bar */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <CalendarIcon className="w-4 h-4 text-indigo-600" />
                <span>{meeting.date} ({meeting.startTime} – {meeting.endTime})</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Duration: {meeting.durationMinutes} mins • {meeting.timezone}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {meeting.meetingLink && !isCancelled && (
                <a
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Join Meeting</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Description & Agenda */}
          {meeting.description && (
            <div>
              <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1">
                Description
              </h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                {meeting.description}
              </p>
            </div>
          )}

          {meeting.agenda && (
            <div>
              <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1">
                Agenda
              </h3>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-3 rounded-xl border border-slate-100 font-mono text-[11px]">
                {meeting.agenda}
              </div>
            </div>
          )}

          {/* Attendees List */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Participants ({meeting.participants.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {meeting.participants.map((p) => (
                <div key={p.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {p.name.charAt(0) || p.email.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 truncate">{p.name || p.email}</p>
                    <p className="text-[10px] text-slate-400 truncate">{p.email}</p>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium">
                    {p.responseStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reminder setting & Background Sync */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">Reminder Set</p>
                <p className="text-[11px] text-slate-500">{meeting.reminder?.label || '15 mins before'}</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">Calendar Sync Status</p>
                <p className="text-[11px] text-emerald-700">Synchronized with Google & Outlook ✓</p>
              </div>
            </div>
          </div>

          {/* Meeting Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                Personal Meeting Notes
              </h3>
              {notesSaved && (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down notes, key decisions, or reminders during the call..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                {isSavingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            {!isCancelled && (
              showConfirmCancel ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-700 font-medium">Cancel meeting?</span>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg"
                  >
                    {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmCancel(false)}
                    className="px-2 py-1 text-slate-500 hover:text-slate-700 text-xs"
                  >
                    Keep
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmCancel(true)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                >
                  Cancel This Meeting
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAssistant(`Summarize details and prep me for ${meeting.title}`);
              }}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI About This Call</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
