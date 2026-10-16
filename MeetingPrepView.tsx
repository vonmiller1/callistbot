import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Share2, 
  ChevronRight,
  HelpCircle,
  Lightbulb,
  ListTodo,
  Check,
  Building
} from 'lucide-react';
import { Meeting, ActionItem } from '../types';

interface MeetingPrepViewProps {
  meetings: Meeting[];
  selectedMeetingId: string;
  onSelectMeeting: (id: string) => void;
  onOpenAssistantWithQuery: (query: string) => void;
  onRegenerateBrief: (meetingId: string) => void;
  isRegenerating: boolean;
}

export const MeetingPrepView: React.FC<MeetingPrepViewProps> = ({
  meetings,
  selectedMeetingId,
  onSelectMeeting,
  onOpenAssistantWithQuery,
  onRegenerateBrief,
  isRegenerating,
}) => {
  const [copied, setCopied] = useState(false);
  const currentMeeting = meetings.find((m) => m.id === selectedMeetingId) || meetings[0];
  const brief = currentMeeting?.brief;

  // Local state for checking off action items interactively
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  const toggleAction = (id: string) => {
    setCompletedActions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopy = () => {
    if (!brief) return;
    const text = `Pre-Meeting Brief: ${currentMeeting.title}
When: ${currentMeeting.timeDisplay} (${currentMeeting.durationMinutes} mins on ${currentMeeting.platform})

Summary:
${brief.executiveSummary}

Key Objective:
${brief.strategicObjective}

Talking Points:
${brief.talkingPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Action Items:
${brief.actionItems.map((a) => `- [ ] ${a.title} (${a.assignee})`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Sidebar: Upcoming Meeting Cards */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Upcoming Meetings</span>
            </h2>
            <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              Today & Tomorrow
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Pick a meeting to see your prepared 1-page brief.
          </p>

          <div className="space-y-2">
            {meetings.map((m) => {
              const isSelected = m.id === selectedMeetingId;
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMeeting(m.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/60 border-indigo-300 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {m.timeDisplay}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-200 text-slate-600 flex items-center gap-1">
                      <Video className="w-3 h-3 text-indigo-500" />
                      {m.platform}
                    </span>
                  </div>

                  <h3 className={`text-sm font-semibold mb-2 line-clamp-2 ${isSelected ? 'text-indigo-950 font-bold' : 'text-slate-800'}`}>
                    {m.title}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {(m.attendees || []).map((att) => (
                        <img
                          key={att.id}
                          src={att.avatar}
                          alt={att.name}
                          title={`${att.name} (${att.role})`}
                          className="w-6 h-6 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Brief Ready
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Helpful Assistant Suggestions */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-indigo-900 text-xs font-bold uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Quick Questions to Ask AI</span>
          </div>
          <p className="text-xs text-slate-600">
            Click any question to ask your assistant right away:
          </p>
          <div className="space-y-1.5">
            <button
              onClick={() => onOpenAssistantWithQuery('What did Sarah say about the budget?')}
              className="w-full text-left text-xs p-2.5 rounded-xl bg-white hover:bg-indigo-600 hover:text-white text-slate-700 border border-indigo-100/80 transition-all flex items-center justify-between group shadow-xs"
            >
              <span>"What did Sarah say about the budget?"</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </button>
            <button
              onClick={() => onOpenAssistantWithQuery('What are my open to-dos with the Vantage team?')}
              className="w-full text-left text-xs p-2.5 rounded-xl bg-white hover:bg-indigo-600 hover:text-white text-slate-700 border border-indigo-100/80 transition-all flex items-center justify-between group shadow-xs"
            >
              <span>"What are my open to-dos with Vantage?"</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </button>
            <button
              onClick={() => onOpenAssistantWithQuery('When do these attendees prefer to meet?')}
              className="w-full text-left text-xs p-2.5 rounded-xl bg-white hover:bg-indigo-600 hover:text-white text-slate-700 border border-indigo-100/80 transition-all flex items-center justify-between group shadow-xs"
            >
              <span>"When do these attendees prefer to meet?"</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Pre-Meeting Brief (Clean & Simple) */}
      <div className="lg:col-span-8 space-y-5">
        {currentMeeting && brief ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            {/* Header Banner */}
            <div className="p-6 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-white border-b border-slate-200/80">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Pre-Meeting Brief
                  </span>
                  <span className="text-xs text-slate-500">
                    Updated {brief.generatedAt}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRegenerateBrief(currentMeeting.id)}
                    disabled={isRegenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-xs transition-colors disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${isRegenerating ? 'animate-spin' : ''}`} />
                    <span>{isRegenerating ? 'Refreshing...' : 'Refresh Brief'}</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-xs transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
                  </button>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {currentMeeting.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  {currentMeeting.timeDisplay} ({currentMeeting.durationMinutes} mins)
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Video className="w-3.5 h-3.5 text-indigo-600" />
                  {currentMeeting.platform}
                </span>
                {currentMeeting.meetingUrl && (
                  <a
                    href={currentMeeting.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    <span>Open Meeting Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Meeting Summary & Goal Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Quick Summary
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {brief.executiveSummary}
                  </p>
                </div>

                <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Meeting Goal
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {brief.strategicObjective}
                  </p>
                </div>
              </div>

              {/* People You're Meeting With & Their Habits */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Who You're Meeting With & Quick Tips
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(brief.participants || []).map((person) => (
                    <div
                      key={person.contactId}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900">
                            {person.name}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {person.statusBadge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-2">
                          {person.role}
                        </p>
                        <p className="text-xs text-slate-600 mb-2">
                          {person.highlightNote}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-amber-700 block mb-0.5">
                          💡 Tip for this call:
                        </span>
                        <p className="text-[11px] text-slate-600 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60 leading-snug">
                          {person.topHabitTip}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items Checklist */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-emerald-600" />
                  Meeting To-Dos & Commitments
                </h3>

                <div className="space-y-2">
                  {brief.actionItems.map((item) => {
                    const isDone = completedActions[item.id] || item.status === 'completed';
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleAction(item.id)}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isDone 
                            ? 'bg-emerald-50/50 border-emerald-200 text-slate-500 line-through' 
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="font-medium">{item.title}</span>
                            <span className="text-[11px] text-slate-500 ml-2 font-normal">
                              ({item.assignee} • {item.dueDate})
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isDone ? 'Done' : 'To Do'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Suggested Talking Points & Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Recommended Talking Points
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {brief.talkingPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                    Helpful Questions to Ask
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {brief.questionsToAsk.map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold text-sm shrink-0">?</span>
                        <span className="italic">{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Friendly Tips */}
              {brief.friendlyTips.length > 0 && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Keep in mind: </span>
                    <span>{brief.friendlyTips.join(' ')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
            <Calendar className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">Select a meeting to view your brief</h3>
          </div>
        )}
      </div>
    </div>
  );
};
