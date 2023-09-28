import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import JSZip from 'jszip';
import { GoogleGenAI } from '@google/genai';
import { db, hashPassword, verifyPassword } from './src/backend/db';
import { Meeting, UserProfile } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High limit for user profile picture uploads (base64 image data)
app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI if available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Authentication Middleware to protect user private data
interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Please log in to continue.' });
  }

  const user = db.getUserBySessionToken(authHeader);
  if (!user) {
    return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
  }

  req.user = user;
  next();
}

// Health Check
app.get('/api/health', (req, res) => {
  return res.json({ status: 'ok', service: 'calist', version: '2.0.0' });
});

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------

// Sign Up with Email
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, confirmPassword, profilePicture } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid work email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match. Please verify.' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    const { salt, hash } = hashPassword(password);
    const userId = 'usr_' + crypto.randomBytes(8).toString('hex');

    const newUser = db.createUser({
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      timezone: 'America/New_York (EST)',
      profilePicture: profilePicture || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80`,
      jobTitle: 'Team Member',
      organization: 'Workspace',
      bio: 'Ready to prepare for productive and impactful meetings.',
      meetingPreferences: {
        preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        preferredHours: '9:00 AM – 5:00 PM',
        bufferMinutes: 10,
        defaultMeetingDuration: 30,
        defaultReminderTime: '15 minutes before',
      },
      salt,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const token = db.createSession(userId);
    const { passwordHash, salt: s, ...safeUser } = newUser;

    return res.status(201).json({
      user: safeUser,
      token,
      message: 'Account created successfully!',
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Unable to create your account at this moment. Please try again.' });
  }
});

// Login with Email
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const user = db.findUserByEmail(email);
    if (!user || !user.passwordHash || !user.salt) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    const valid = verifyPassword(password, user.salt, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    const token = db.createSession(user.id);
    const { passwordHash, salt, ...safeUser } = user;

    return res.json({
      user: safeUser,
      token,
      message: 'Logged in successfully.',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login service temporarily unavailable. Please try again.' });
  }
});

// OAuth Single Sign-On (Google / Microsoft / Other)
app.post('/api/auth/oauth', (req, res) => {
  try {
    const { provider, email, name, avatar } = req.body;

    if (!provider) {
      return res.status(400).json({ error: 'OAuth provider is required.' });
    }

    const userEmail = email || `user.${provider}@calist-workspace.com`;
    let user = db.findUserByEmail(userEmail);

    if (!user) {
      const userId = 'usr_' + crypto.randomBytes(8).toString('hex');
      user = db.createUser({
        id: userId,
        name: name || (provider === 'google' ? 'Google User' : 'Microsoft User'),
        email: userEmail.toLowerCase(),
        timezone: 'America/New_York (EST)',
        profilePicture: avatar || (provider === 'google' 
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80'),
        jobTitle: 'Workspace Specialist',
        organization: provider === 'google' ? 'Google Enterprise' : 'Microsoft 365 Tenant',
        bio: 'Connected via ' + provider.toUpperCase() + ' Single Sign-On.',
        meetingPreferences: {
          preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          preferredHours: '9:00 AM – 5:00 PM',
          bufferMinutes: 10,
          defaultMeetingDuration: 30,
          defaultReminderTime: '15 minutes before',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const token = db.createSession(user.id);
    const { passwordHash, salt, ...safeUser } = user;

    return res.json({
      user: safeUser,
      token,
      provider,
      message: `Signed in successfully with ${provider.toUpperCase()}.`,
    });
  } catch (err: any) {
    console.error('OAuth error:', err);
    return res.status(500).json({ error: 'OAuth login failed. Please try again.' });
  }
});

// Current User Session verification
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  return res.json({ user: req.user });
});

// Logout
app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res) => {
  const token = req.headers.authorization;
  if (token) {
    db.deleteSession(token);
  }
  return res.json({ success: true, message: 'Logged out cleanly.' });
});

// -------------------------------------------------------------
// USER PROFILE ROUTES
// -------------------------------------------------------------

app.get('/api/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  return res.json({ profile: req.user });
});

function handleUpdateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, phone, jobTitle, organization, timezone, bio, profilePicture, meetingPreferences } = req.body;

    const updated = db.updateUser(req.user!.id, {
      ...(name ? { name: name.trim() } : {}),
      ...(phone !== undefined ? { phone: phone.trim() } : {}),
      ...(jobTitle !== undefined ? { jobTitle: jobTitle.trim() } : {}),
      ...(organization !== undefined ? { organization: organization.trim() } : {}),
      ...(timezone !== undefined ? { timezone } : {}),
      ...(bio !== undefined ? { bio: bio.trim() } : {}),
      ...(profilePicture !== undefined ? { profilePicture } : {}),
      ...(meetingPreferences ? { meetingPreferences } : {}),
    });

    if (!updated) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    return res.json({
      profile: updated,
      message: 'Profile updated successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
}

app.put('/api/profile', requireAuth, handleUpdateProfile);
app.post('/api/profile', requireAuth, handleUpdateProfile);
app.post('/api/user/profile', requireAuth, handleUpdateProfile);

// -------------------------------------------------------------
// MEETINGS ROUTES
// -------------------------------------------------------------

// Get All Meetings for current user
app.get('/api/meetings', requireAuth, (req: AuthenticatedRequest, res) => {
  const meetings = db.getMeetingsForUser(req.user!.id);
  return res.json({ meetings });
});

// Get Single Meeting
app.get('/api/meetings/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const meeting = db.getMeetingById(req.params.id, req.user!.id);
  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found or you do not have permission to view it.' });
  }
  return res.json({ meeting });
});

// Create / Schedule Meeting
app.post('/api/meetings', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      title,
      description,
      agenda,
      date,
      startTime,
      endTime,
      timezone,
      durationMinutes,
      meetingLink,
      location,
      platform,
      recurring,
      reminder,
      notes,
      participants,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Please enter a meeting title.' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Please select a meeting date.' });
    }
    if (!startTime) {
      return res.status(400).json({ error: 'Please enter a meeting start time.' });
    }

    const meetingId = 'mtg_' + crypto.randomBytes(8).toString('hex');
    const user = req.user!;

    // Autonomous Pre-Meeting Brief Generation
    let brief = {
      executiveSummary: `Scheduled meeting with ${participants?.length || 0} participants to discuss "${title}".`,
      strategicObjective: agenda || description || `Align on ${title} outcomes and next steps.`,
      talkingPoints: [
        `Welcome all participants and review ${title} objectives.`,
        'Walk through open agenda items and key discussion points.',
        'Agree on clear action items and ownership before wrapping up.',
      ],
      questionsToAsk: [
        `"Are all stakeholders aligned on the proposed direction for ${title}?"`,
        '"Are there any blockers we can resolve right now?"',
      ],
      friendlyTips: [
        'Check audio/video 2 minutes before the call.',
        'Keep meeting on schedule to respect attendees\' calendars.',
      ],
      actionItems: [
        {
          id: 'act-new-1',
          title: `Share recap and notes from ${title}`,
          assignee: user.name,
          dueDate: date,
          status: 'pending' as const,
        },
      ],
    };

    // If Gemini AI is active, enhance the brief intelligently
    if (ai && (description || agenda)) {
      try {
        const prompt = `Synthesize a brief Pre-Meeting Dossier for a meeting titled: "${title}"
Agenda/Description: "${agenda || description}"
Participants: ${JSON.stringify(participants || [])}

Provide clean JSON matching this format:
{
  "executiveSummary": "string",
  "strategicObjective": "string",
  "talkingPoints": ["point 1", "point 2", "point 3"],
  "questionsToAsk": ["question 1", "question 2"],
  "friendlyTips": ["tip 1", "tip 2"]
}`;

        const aiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const parsed = JSON.parse(aiRes.text || '{}');
        if (parsed.executiveSummary) {
          brief = {
            ...brief,
            ...parsed,
          };
        }
      } catch (e) {
        console.warn('AI brief enhancement fallback:', e);
      }
    }

    const newMeeting: Meeting = {
      id: meetingId,
      organizerId: user.id,
      organizerName: user.name,
      organizerEmail: user.email,
      title: title.trim(),
      description: description?.trim() || '',
      agenda: agenda?.trim() || '',
      date,
      startTime: startTime || '10:00',
      endTime: endTime || '10:30',
      timezone: timezone || user.timezone || 'America/New_York (EST)',
      durationMinutes: durationMinutes || 30,
      meetingLink: meetingLink || (platform === 'Zoom' ? `https://zoom.us/j/${Math.floor(1000000000 + Math.random() * 9000000000)}` : `https://meet.google.com/${crypto.randomBytes(3).toString('hex')}-${crypto.randomBytes(4).toString('hex')}`),
      location: location || platform || 'Virtual Meeting',
      platform: platform || 'Google Meet',
      status: 'confirmed',
      recurring: recurring || 'none',
      reminder: reminder || {
        enabled: true,
        timeBeforeMinutes: 15,
        label: '15 minutes before',
      },
      notes: notes || '',
      participants: Array.isArray(participants) ? participants : [],
      brief,
      sourceCalendar: 'internal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = db.createMeeting(newMeeting);
    return res.status(201).json({
      meeting: saved,
      message: 'Meeting scheduled successfully!',
    });
  } catch (err: any) {
    console.error('Error creating meeting:', err);
    return res.status(500).json({ error: 'Failed to schedule meeting. Please check inputs.' });
  }
});

// Update Meeting
app.put('/api/meetings/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const updated = db.updateMeeting(req.params.id, req.body, req.user!.id);
    if (!updated) {
      return res.status(404).json({ error: 'Meeting not found.' });
    }
    return res.json({ meeting: updated, message: 'Meeting updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Could not update meeting.' });
  }
});

// Cancel Meeting
app.post('/api/meetings/:id/cancel', requireAuth, (req: AuthenticatedRequest, res) => {
  const success = db.cancelMeeting(req.params.id, req.user!.id);
  if (!success) {
    return res.status(404).json({ error: 'Meeting not found.' });
  }
  const updatedMeeting = db.getMeetingById(req.params.id, req.user!.id);
  return res.json({ success: true, meeting: updatedMeeting, message: 'Meeting was cancelled.' });
});

// Delete Meeting
app.delete('/api/meetings/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const success = db.deleteMeeting(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Meeting not found.' });
  }
  return res.json({ success: true, message: 'Meeting removed.' });
});

// -------------------------------------------------------------
// NOTIFICATIONS ROUTES
// -------------------------------------------------------------

app.get('/api/notifications', requireAuth, (req: AuthenticatedRequest, res) => {
  const notifications = db.getNotificationsForUser(req.user!.id);
  return res.json({ notifications });
});

app.post('/api/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res) => {
  db.markNotificationAsRead(req.params.id, req.user!.id);
  return res.json({ success: true });
});

app.post('/api/notifications/read-all', requireAuth, (req: AuthenticatedRequest, res) => {
  db.markAllNotificationsAsRead(req.user!.id);
  return res.json({ success: true, message: 'All notifications marked as read.' });
});

app.delete('/api/notifications', requireAuth, (req: AuthenticatedRequest, res) => {
  db.clearNotifications(req.user!.id);
  return res.json({ success: true, message: 'Notifications cleared.' });
});

// -------------------------------------------------------------
// CALENDAR INTEGRATIONS (Background sync & connection)
// -------------------------------------------------------------

app.get('/api/calendar/integrations', requireAuth, (req: AuthenticatedRequest, res) => {
  const integrations = db.getCalendarIntegrations(req.user!.id);
  return res.json({ integrations });
});

app.post('/api/calendar/connect', requireAuth, (req: AuthenticatedRequest, res) => {
  const { provider } = req.body;
  if (provider !== 'google' && provider !== 'microsoft') {
    return res.status(400).json({ error: 'Supported providers are "google" and "microsoft".' });
  }

  db.updateCalendarIntegration(req.user!.id, provider, 'connected');
  return res.json({
    success: true,
    message: `${provider === 'google' ? 'Google Calendar' : 'Microsoft Outlook'} connected. Background sync is active.`,
  });
});

app.post('/api/calendar/disconnect', requireAuth, (req: AuthenticatedRequest, res) => {
  const { provider } = req.body;
  db.updateCalendarIntegration(req.user!.id, provider, 'disconnected');
  return res.json({
    success: true,
    message: `${provider === 'google' ? 'Google Calendar' : 'Microsoft Outlook'} disconnected. Background sync stopped.`,
  });
});

app.post('/api/calendar/sync-now', requireAuth, (req: AuthenticatedRequest, res) => {
  const result = db.syncCalendarNow(req.user!.id);
  return res.json({
    success: true,
    message: 'Calendars synchronized in background.',
    ...result,
  });
});

// -------------------------------------------------------------
// AI ASSISTANT QUERY
// -------------------------------------------------------------
app.post('/api/chat', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required.' });

    const user = req.user!;
    const meetings = db.getMeetingsForUser(user.id);

    if (ai) {
      try {
        const prompt = `You are Calist, a warm, clear, and helpful AI meeting preparation assistant for ${user.name} (${user.jobTitle || 'Professional'}).
Below is the user's scheduled meetings and context:
${JSON.stringify(meetings.map((m) => ({ title: m.title, date: m.date, time: m.startTime, participants: m.participants.map((p) => p.name) })), null, 2)}

User Question: "${query}"

Provide a friendly, direct, concise, and helpful answer. Avoid technical jargon.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        return res.json({ answer: response.text || null });
      } catch (err: any) {
        console.warn('Gemini chat error:', err?.message || err);
      }
    }

    return res.json({ answer: null });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to process assistant request.' });
  }
});

// -------------------------------------------------------------
// DOWNLOAD UPGRADED ZIP EXPORT
// -------------------------------------------------------------
app.get('/api/export-full-zip', async (req, res) => {
  try {
    const zip = new JSZip();

    const filesToInclude = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'index.html',
      'metadata.json',
      '.env.example',
      'server.ts',
      'src/main.tsx',
      'src/App.tsx',
      'src/index.css',
      'src/types.ts',
      'src/backend/db.ts',
      'src/services/api.ts',
      'src/services/zipExporter.ts',
      'src/data/mockWorkspace.ts',
      'src/data/simpleRepoFiles.ts',
      'src/components/Header.tsx',
      'src/components/Navbar.tsx',
      'src/components/AuthModal.tsx',
      'src/components/Dashboard.tsx',
      'src/components/ProfileModal.tsx',
      'src/components/ScheduleMeetingModal.tsx',
      'src/components/MeetingDetailsModal.tsx',
      'src/components/MeetingPrepView.tsx',
      'src/components/AssistantChatPane.tsx',
      'src/components/ContactHabitsView.tsx',
      'src/components/IntegrationsPortal.tsx',
      'src/components/SettingsModal.tsx',
      'src/components/NotificationsDropdown.tsx',
    ];

    const readmeContent = `# Calist - AI Meeting Prep & Workspace Intelligence

A clean, user-friendly meeting preparation and calendar intelligence app for working professionals.

## Key Capabilities
- **Authentication**: Sign up & Login with Email (secure salted PBKDF2), Google, Microsoft, and demo accounts.
- **User Profile**: Profile picture upload/removal, bio, time zone, organization, and meeting preferences.
- **Main Dashboard**: Today's meetings, upcoming meetings, recent meetings, empty states, and quick actions.
- **Meeting Scheduler**: Schedule meetings with multiple participants, duration, reminder times, recurring options, and instant confirmation.
- **Meeting Details & Management**: View briefs, edit personal notes, and cancel meetings.
- **Calendar Background Sync**: Google Calendar and Microsoft Outlook synchronization running seamlessly in the background.
- **AI Assistant**: Instant meeting briefs, talking points, questions to ask, and attendee habit tips.

## Setup Instructions
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. (Optional) Set your \`GEMINI_API_KEY\` in \`.env\`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Open [http://localhost:3000](http://localhost:3000) in your browser.
`;

    zip.file('README.md', readmeContent);

    for (const filePath of filesToInclude) {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        zip.file(filePath, content);
      }
    }

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="calist-upgraded-fullstack.zip"');
    return res.send(zipBuffer);
  } catch (err: any) {
    console.error('Failed to generate full zip:', err);
    return res.status(500).json({ error: 'Failed to create zip package.' });
  }
});

// Serve frontend in production / mount vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Calist Full-Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
