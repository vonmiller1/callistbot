import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  Lightbulb, 
  ChevronRight,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Contact } from '../types';

interface ContactHabitsViewProps {
  contacts: Contact[];
  onAskAboutContact: (contactName: string) => void;
}

export const ContactHabitsView: React.FC<ContactHabitsViewProps> = ({
  contacts,
  onAskAboutContact,
}) => {
  const [selectedId, setSelectedId] = useState<string>(contacts[0]?.id || '');
  const active = contacts.find((c) => c.id === selectedId) || contacts[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left List of People */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Key Colleagues & Clients</span>
            </h2>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              {contacts.length} People
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Calist tracks preferred hours and meeting habits to save you time.
          </p>

          <div className="space-y-2">
            {contacts.map((c) => {
              const isSelected = c.id === selectedId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs font-semibold truncate ${isSelected ? 'text-indigo-950 font-bold' : 'text-slate-800'}`}>
                        {c.name}
                      </h3>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        {c.habits.meetingPunctualityScore}% on time
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {c.role} • {c.company}
                    </p>
                    <p className="text-[11px] text-indigo-600 truncate mt-0.5 font-medium">
                      {c.habits.preferredMeetingTime}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Person Profile & Helpful Tips */}
      <div className="lg:col-span-8 space-y-5">
        {active && (
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-white border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={active.avatar}
                  alt={active.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
                />
                <div>
                  <h1 className="text-lg font-bold text-slate-900">
                    {active.name}
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    {active.role} • <span className="text-indigo-600">{active.company}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {active.email} • Last contacted: {active.lastContacted}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onAskAboutContact(active.name)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-all self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI About {active.name.split(' ')[0]}</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Prep Tip Highlight */}
              <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>Best Way to Work with {active.name.split(' ')[0]}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans pt-1">
                  {active.habits.optimalPrepTip}
                </p>
              </div>

              {/* Habit Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Best Time to Meet
                  </span>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    {active.habits.preferredMeetingTime}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {active.habits.preferredDays.map((d) => (
                      <span key={d} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 text-[10px] rounded font-medium">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Meeting Length
                  </span>
                  <p className="text-xs font-bold text-slate-800">
                    {active.habits.meetingDurationPreference}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Keeps to time limits
                  </p>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Punctuality
                  </span>
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {active.habits.meetingPunctualityScore}% on-time arrival
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Very reliable attendance
                  </p>
                </div>
              </div>

              {/* Communication Style */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Communication Style</span>
                <p className="text-slate-600">
                  {active.habits.commsStyle}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
