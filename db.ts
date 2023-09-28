import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { UserProfile, Meeting, AppNotification, CalendarIntegration } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'calist_store.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredUser extends UserProfile {
  passwordHash?: string;
  salt?: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  meetings: Meeting[];
  notifications: AppNotification[];
  calendarIntegrations: CalendarIntegration[];
  sessions: { token: string; userId: string; createdAt: string }[];
}

// Password hashing utility with salt
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return checkHash === hash;
}

// Initial seed data so users can test immediately or create new accounts
function getInitialData(): DatabaseSchema {
  const { salt, hash } = hashPassword('Password123!');
  const demoUserId = 'user-alex-demo';

  const demoUser: StoredUser = {
    id: demoUserId,
    name: 'Alex Rivera',
    email: 'alex.rivera@calist.ai',
    phone: '+1 (555) 349-8291',
    jobTitle: 'VP of Product Engineering',
    organization: 'Calist Systems & BioTech Labs',
    timezone: 'America/New_York (EST)',
    bio: 'Product leader focused on seamless workspace workflows, executive decision support, and collaborative team productivity.',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
    meetingPreferences: {
      preferredDays: ['Monday', 'Tuesday', 'Thursday'],
      preferredHours: '10:00 AM – 4:00 PM EST',
      bufferMinutes: 10,
      defaultMeetingDuration: 30,
      defaultReminderTime: '15 minutes before',
    },
    salt,
    passwordHash: hash,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const meetings: Meeting[] = [
    {
      id: 'mtg-vantage-q4',
      organizerId: demoUserId,
      organizerName: 'Alex Rivera',
      organizerEmail: 'alex.rivera@calist.ai',
      title: 'Vantage BioTech Contract Review & Next Steps',
      description: 'Review final enterprise terms, verify login permissions with Dave Chen, and execute Q4 expansion.',
      agenda: '1. Welcome & 2:30 PM hard-stop check (2 mins)\n2. Demo staging single sign-on to Dave Chen (5 mins)\n3. Verify research performance for Dr. Vance (5 mins)\n4. Contract signoff approval with Sarah (10 mins)',
      date: today,
      startTime: '14:00',
      endTime: '14:30',
      timezone: 'America/New_York (EST)',
      durationMinutes: 30,
      meetingLink: 'https://zoom.us/j/8492019381',
      location: 'Virtual (Zoom)',
      platform: 'Zoom',
      status: 'confirmed',
      recurring: 'none',
      reminder: {
        enabled: true,
        timeBeforeMinutes: 15,
        label: '15 minutes before',
      },
      notes: 'Sarah approved the $240,000 tier for 250 seats yesterday. She has a strict earnings call at 2:30 PM.',
      participants: [
        {
          id: 'part-1',
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@vantage.com',
          role: 'VP Commercial Strategy',
          responseStatus: 'accepted',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
        },
        {
          id: 'part-2',
          name: 'Dr. Marcus Vance',
          email: 'm.vance@vantage.com',
          role: 'Head of Research',
          responseStatus: 'accepted',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
        },
        {
          id: 'part-3',
          name: 'Dave Chen',
          email: 'dave.chen@vantage.com',
          role: 'Head of IT & Security',
          responseStatus: 'accepted',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
        },
      ],
      brief: {
        executiveSummary: 'Sarah has approved the $240k annual tier for 250 team seats. Today\'s 30-minute sync is to give Dave Chen a quick look at single sign-on and confirm smooth speed for Dr. Vance before signing.',
        strategicObjective: 'Confirm the two technical checklist items in the first 15 minutes, then get Sarah\'s green light to dispatch the DocuSign agreement.',
        talkingPoints: [
          'Acknowledge Sarah\'s hard stop warmly: "Sarah, we know you have an earnings call right at 2:30 PM, so we\'ll keep this to 20 focused minutes."',
          'Show Dave Chen the staging login link right away for a 60-second sign-off.',
          'Show Dr. Vance the live 1.1-second speed test so he sees the performance firsthand.',
          'Wrap up 5 minutes early to finalize agreement dispatch.',
        ],
        questionsToAsk: [
          '"Dave, does this test link give your security team everything needed?"',
          '"Marcus, how does this 1.1-second speed look for your team\'s daily research?"',
          '"Sarah, if both items are good, are you comfortable receiving the DocuSign link this afternoon?"',
        ],
        friendlyTips: [
          'Sarah leaves right at 2:30 PM — do not save the agreement discussion for the last minute.',
          'Keep Marcus engaged with a live screen demo instead of reading slides.',
        ],
        actionItems: [
          {
            id: 'act-1',
            title: 'Share the test login link with Dave Chen',
            assignee: 'Alex Rivera',
            dueDate: 'During call (first 5 mins)',
            status: 'pending',
          },
          {
            id: 'act-2',
            title: 'Show Dr. Vance the 1.1s live search speed',
            assignee: 'Alex Rivera',
            dueDate: 'During call',
            status: 'pending',
          },
          {
            id: 'act-3',
            title: 'Send final contract for signature to Sarah',
            assignee: 'Sarah Jenkins',
            dueDate: 'By tomorrow 5 PM',
            status: 'pending',
          },
        ],
      },
      sourceCalendar: 'google',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mtg-apex-sync',
      organizerId: demoUserId,
      organizerName: 'Alex Rivera',
      organizerEmail: 'alex.rivera@calist.ai',
      title: 'Apex Systems Weekly Catchup & Project Review',
      description: 'Review product milestones, case study draft, and upcoming customer rollout schedule.',
      agenda: '1. Case study feedback\n2. Customer launch date alignment\n3. Q&A and next action items',
      date: tomorrow,
      startTime: '10:00',
      endTime: '10:30',
      timezone: 'America/New_York (EST)',
      durationMinutes: 30,
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      location: 'Google Meet',
      platform: 'Google Meet',
      status: 'confirmed',
      recurring: 'weekly',
      reminder: {
        enabled: true,
        timeBeforeMinutes: 10,
        label: '10 minutes before',
      },
      notes: 'Elena prefers morning syncs and open brainstorm discussions.',
      participants: [
        {
          id: 'part-4',
          name: 'Elena Rostova',
          email: 'elena.rostova@apex.io',
          role: 'Product Director',
          responseStatus: 'accepted',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
        },
      ],
      brief: {
        executiveSummary: 'Weekly friendly sync with Elena to review product launch timelines, marketing milestones, and shared tasks.',
        strategicObjective: 'Confirm design sign-offs and finalize dates for the customer case study.',
        talkingPoints: [
          'Celebrate the completion of the draft customer case study.',
          'Confirm release dates for the co-marketing announcement.',
        ],
        questionsToAsk: [
          '"Elena, which launch week works best for your team\'s press schedule?"',
        ],
        friendlyTips: [
          'Mornings are Elena\'s highest energy time.',
        ],
        actionItems: [
          {
            id: 'act-apex-1',
            title: 'Review the two quotes with Elena',
            assignee: 'Alex Rivera',
            dueDate: 'Tomorrow',
            status: 'pending',
          },
        ],
      },
      sourceCalendar: 'google',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: 'notif-1',
      userId: demoUserId,
      title: 'Upcoming Meeting Reminder',
      message: 'Vantage BioTech Contract Review starts in 15 minutes on Zoom.',
      type: 'reminder',
      readStatus: false,
      meetingId: 'mtg-vantage-q4',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: 'notif-2',
      userId: demoUserId,
      title: 'Google Calendar Synchronized',
      message: 'Background calendar sync completed. 2 upcoming events verified.',
      type: 'sync',
      readStatus: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
      id: 'notif-3',
      userId: demoUserId,
      title: 'Participant Response Accepted',
      message: 'Elena Rostova accepted your invitation to Apex Systems Weekly Catchup.',
      type: 'invite',
      readStatus: true,
      meetingId: 'mtg-apex-sync',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ];

  const calendarIntegrations: CalendarIntegration[] = [
    {
      id: 'cal-int-google',
      userId: demoUserId,
      provider: 'google',
      name: 'Google Calendar',
      accountEmail: 'alex.rivera@calist.ai',
      connectionStatus: 'connected',
      synchronizationStatus: 'active',
      lastSynced: 'Just now',
      autoSyncEnabled: true,
    },
    {
      id: 'cal-int-ms',
      userId: demoUserId,
      provider: 'microsoft',
      name: 'Microsoft Outlook Calendar',
      accountEmail: 'alex.rivera@outlook.com',
      connectionStatus: 'connected',
      synchronizationStatus: 'active',
      lastSynced: '15 mins ago',
      autoSyncEnabled: true,
    },
  ];

  const sessions = [
    {
      token: 'session-demo-token-alex',
      userId: demoUserId,
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    users: [demoUser],
    meetings,
    notifications,
    calendarIntegrations,
    sessions,
  };
}

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed reading DB file, reinitializing', e);
    }
    const initial = getInitialData();
    this.save(initial);
    return initial;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing DB file', e);
    }
  }

  // Users
  public findUserByEmail(email: string): StoredUser | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): StoredUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(user: StoredUser): StoredUser {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    const existing = this.data.users[idx];
    const updated: StoredUser = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.users[idx] = updated;
    this.save();
    return updated;
  }

  // Sessions
  public createSession(userId: string): string {
    const token = 'tok_' + crypto.randomBytes(24).toString('hex');
    this.data.sessions.push({
      token,
      userId,
      createdAt: new Date().toISOString(),
    });
    this.save();
    return token;
  }

  public getUserBySessionToken(token: string): UserProfile | null {
    if (!token) return null;
    const cleanToken = token.replace('Bearer ', '').trim();
    const session = this.data.sessions.find((s) => s.token === cleanToken);
    if (!session) return null;
    const user = this.findUserById(session.userId);
    if (!user) return null;
    // Strip sensitive password fields before returning
    const { passwordHash, salt, ...safeUser } = user;
    return safeUser;
  }

  public deleteSession(token: string) {
    const cleanToken = token.replace('Bearer ', '').trim();
    this.data.sessions = this.data.sessions.filter((s) => s.token !== cleanToken);
    this.save();
  }

  // Meetings
  public getMeetingsForUser(userId: string): Meeting[] {
    return this.data.meetings
      .filter((m) => m.organizerId === userId || m.participants.some((p) => p.email === this.findUserById(userId)?.email))
      .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
  }

  public getMeetingById(id: string, userId: string): Meeting | undefined {
    return this.getMeetingsForUser(userId).find((m) => m.id === id);
  }

  public createMeeting(meeting: Meeting): Meeting {
    this.data.meetings.unshift(meeting);
    // Automatically generate notification for meeting creation
    this.createNotification({
      id: 'notif-' + Date.now(),
      userId: meeting.organizerId,
      title: 'Meeting Scheduled',
      message: `"${meeting.title}" scheduled for ${meeting.date} at ${meeting.startTime}.`,
      type: 'invite',
      readStatus: false,
      meetingId: meeting.id,
      createdAt: new Date().toISOString(),
    });
    this.save();
    return meeting;
  }

  public updateMeeting(id: string, updates: Partial<Meeting>, userId: string): Meeting | null {
    const idx = this.data.meetings.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    const existing = this.data.meetings[idx];
    const updated: Meeting = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.meetings[idx] = updated;

    this.createNotification({
      id: 'notif-' + Date.now(),
      userId,
      title: 'Meeting Updated',
      message: `Details for "${updated.title}" were updated.`,
      type: 'change',
      readStatus: false,
      meetingId: id,
      createdAt: new Date().toISOString(),
    });

    this.save();
    return updated;
  }

  public cancelMeeting(id: string, userId: string): boolean {
    const idx = this.data.meetings.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    const meeting = this.data.meetings[idx];
    meeting.status = 'cancelled';
    meeting.updatedAt = new Date().toISOString();

    this.createNotification({
      id: 'notif-' + Date.now(),
      userId,
      title: 'Meeting Cancelled',
      message: `"${meeting.title}" has been cancelled.`,
      type: 'cancellation',
      readStatus: false,
      meetingId: id,
      createdAt: new Date().toISOString(),
    });

    this.save();
    return true;
  }

  public deleteMeeting(id: string): boolean {
    const initialLen = this.data.meetings.length;
    this.data.meetings = this.data.meetings.filter((m) => m.id !== id);
    this.save();
    return this.data.meetings.length < initialLen;
  }

  // Notifications
  public getNotificationsForUser(userId: string): AppNotification[] {
    return this.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(notif: AppNotification): AppNotification {
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id && n.userId === userId);
    if (!notif) return false;
    notif.readStatus = true;
    this.save();
    return true;
  }

  public markAllNotificationsAsRead(userId: string) {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) n.readStatus = true;
    });
    this.save();
  }

  public clearNotifications(userId: string) {
    this.data.notifications = this.data.notifications.filter((n) => n.userId !== userId);
    this.save();
  }

  // Calendar Integrations
  public getCalendarIntegrations(userId: string): CalendarIntegration[] {
    return this.data.calendarIntegrations.filter((c) => c.userId === userId);
  }

  public updateCalendarIntegration(userId: string, provider: 'google' | 'microsoft', status: 'connected' | 'disconnected') {
    const existing = this.data.calendarIntegrations.find((c) => c.userId === userId && c.provider === provider);
    if (existing) {
      existing.connectionStatus = status;
      existing.synchronizationStatus = status === 'connected' ? 'active' : 'paused';
      existing.lastSynced = status === 'connected' ? 'Just now' : existing.lastSynced;
    } else {
      this.data.calendarIntegrations.push({
        id: `cal-${provider}-${Date.now()}`,
        userId,
        provider,
        name: provider === 'google' ? 'Google Calendar' : 'Microsoft Outlook Calendar',
        accountEmail: this.findUserById(userId)?.email || 'user@work.com',
        connectionStatus: status,
        synchronizationStatus: status === 'connected' ? 'active' : 'paused',
        lastSynced: 'Just now',
        autoSyncEnabled: true,
      });
    }

    if (status === 'connected') {
      this.createNotification({
        id: 'notif-' + Date.now(),
        userId,
        title: `${provider === 'google' ? 'Google Calendar' : 'Outlook'} Connected`,
        message: 'Background synchronization is active. Meeting changes will update automatically.',
        type: 'sync',
        readStatus: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.save();
  }

  public syncCalendarNow(userId: string): { importedCount: number } {
    this.data.calendarIntegrations
      .filter((c) => c.userId === userId && c.connectionStatus === 'connected')
      .forEach((c) => {
        c.lastSynced = 'Just now';
        c.synchronizationStatus = 'active';
      });

    this.createNotification({
      id: 'notif-' + Date.now(),
      userId,
      title: 'Calendar Synchronized',
      message: 'All connected calendars checked in background. Meetings are up-to-date.',
      type: 'sync',
      readStatus: false,
      createdAt: new Date().toISOString(),
    });

    this.save();
    return { importedCount: 2 };
  }
}

export const db = new DatabaseService();
