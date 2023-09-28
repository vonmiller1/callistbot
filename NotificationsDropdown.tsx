import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Clock, 
  Calendar, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSelectMeeting: (meetingId?: string) => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onSelectMeeting,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'sync':
        return <RefreshCw className="w-4 h-4 text-emerald-500" />;
      case 'cancellation':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Calendar className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div 
      className="absolute right-0 top-14 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              title="Clear all"
              className="text-slate-400 hover:text-rose-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">You're all caught up!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">No new alerts or meeting reminders.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                onMarkRead(notif.id);
                if (notif.meetingId) {
                  onSelectMeeting(notif.meetingId);
                  onClose();
                }
              }}
              className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                !notif.readStatus ? 'bg-indigo-50/30' : ''
              }`}
            >
              <div className="mt-0.5 p-1.5 bg-slate-100 rounded-lg shrink-0 h-7 w-7 flex items-center justify-center">
                {getIcon(notif.type)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`text-xs font-semibold truncate ${!notif.readStatus ? 'text-indigo-950 font-bold' : 'text-slate-800'}`}>
                    {notif.title}
                  </p>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                  {notif.message}
                </p>
              </div>

              {!notif.readStatus && (
                <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 self-center"></div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
        Automatic meeting reminders trigger 15 mins before calls
      </div>
    </div>
  );
};
