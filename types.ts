export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  organization?: string;
  timezone: string;
  bio?: string;
  profilePicture?: string;
  meetingPreferences?: {
    preferredDays: string[];
    preferredHours: string;
    bufferMinutes: number;
    defaultMeetingDuration: number;
    defaultReminderTime: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContactBehavioralHabits {
  preferredMeetingTime: string;
  preferredDays: string[];
  meetingPunctualityScore: number;
  commsStyle: string;
  meetingDurationPreference: string;
  optimalPrepTip: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  avatar: string;
  habits: ContactBehavioralHabits;
  lastContacted: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: string;
  responseStatus: 'accepted' | 'tentative' | 'declined' | 'invited';
  avatar?: string;
}

export interface ParticipantIntel {
  contactId: string;
  name: string;
  role: string;
  statusBadge: string;
  highlightNote: string;
  topHabitTip: string;
}

export interface MeetingReminder {
  enabled: boolean;
  timeBeforeMinutes: number;
  label: string;
}

export interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: 'pending' | 'completed';
}

export interface ContextNote {
  id: string;
  source: string;
  date: string;
  text: string;
}

export interface MeetingBrief {
  id?: string;
  meetingId?: string;
  generatedAt?: string;
  executiveSummary: string;
  strategicObjective: string;
  participants?: ParticipantIntel[];
  contextNotes?: ContextNote[];
  talkingPoints: string[];
  questionsToAsk: string[];
  friendlyTips: string[];
  actionItems: ActionItem[];
}

export interface Meeting {
  id: string;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  organizer?: string;
  title: string;
  description?: string;
  agenda?: string;
  date: string;
  startTime: string;
  endTime: string;
  timeDisplay?: string;
  scheduledTime?: string;
  timezone: string;
  durationMinutes: number;
  meetingLink?: string;
  meetingUrl?: string;
  location?: string;
  platform: 'Google Meet' | 'Microsoft Teams' | 'Zoom' | 'In-Person';
  status: 'confirmed' | 'rescheduled' | 'cancelled';
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  reminder: MeetingReminder;
  notes?: string;
  participants: Participant[];
  attendees?: Contact[];
  brief?: MeetingBrief;
  sourceCalendar?: 'google' | 'microsoft' | 'internal';
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'invite' | 'change' | 'cancellation' | 'sync';
  readStatus: boolean;
  meetingId?: string;
  createdAt: string;
}

export interface CalendarIntegration {
  id: string;
  userId: string;
  provider: 'google' | 'microsoft';
  name: string;
  accountEmail: string;
  connectionStatus: 'connected' | 'disconnected' | 'syncing';
  synchronizationStatus: 'active' | 'paused' | 'error';
  lastSynced: string;
  autoSyncEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type IntegrationProvider = 
  | 'google'
  | 'microsoft'
  | 'slack'
  | 'hubspot'
  | 'zoom'
  | 'linear';

export interface IntegrationAccount {
  id: string;
  provider: IntegrationProvider;
  name: string;
  category: 'calendar' | 'email' | 'chat' | 'crm' | 'video' | 'tasks';
  accountEmail?: string;
  status: 'connected' | 'syncing' | 'disconnected';
  lastSyncedAt: string;
  description: string;
}

export interface SimpleRepoFile {
  path: string;
  language: string;
  description: string;
  content: string;
}
