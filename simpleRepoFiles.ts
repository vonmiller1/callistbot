import { SimpleRepoFile } from '../types';

export const SIMPLE_REPO_FILES: SimpleRepoFile[] = [
  {
    path: 'README.md',
    language: 'markdown',
    description: 'Complete application setup, authentication instructions, and database guide.',
    content: `# Calist: AI Meeting Prep & Workspace Intelligence Platform

Calist is an enterprise-ready workspace intelligence platform that prepares working professionals for high-impact meetings with automated Pre-Meeting Briefs, contact habit intelligence, and background calendar synchronization (Google Calendar & Microsoft Outlook).

---

## 🚀 Key Features

1. **Authentication & Account Creation**:
   - Continue with Google, Microsoft, or Email registration.
   - Salted PBKDF2 password hashing (no plain text storage).
   - One-click demo sign-in for testing.

2. **User Profile & Customization**:
   - Device gallery profile photo upload, preview, and removal.
   - Job title, organization, phone number, timezone, and meeting preferences.

3. **Autonomous Pre-Meeting Briefs**:
   - Formatted 1-page dossiers with executive summaries, talking points, questions to ask, and attendee habit tips.
   - Interactive action item checkboxes.

4. **Meeting Scheduling & Management**:
   - Schedule meetings with multiple participants, custom reminder alerts (5m, 10m, 15m, 30m, 60m), and meeting links.
   - Meeting details page to edit personal notes, reschedule, or cancel.

5. **Background Calendar Synchronization**:
   - Integrated with Google Calendar and Microsoft Outlook in Settings → Calendar & Integrations.
   - Works automatically in the background without dominating the dashboard interface.

6. **Notification System**:
   - Header bell alert dropdown for meeting reminders, sync updates, and RSVP responses.

---

## 🛠 Local Setup & Run

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment (Optional)
Copy \`.env.example\` to \`.env\` and add your Gemini API key if you want live dynamic AI brief enhancement:
\`\`\`bash
cp .env.example .env
\`\`\`

### 3. Start Application
\`\`\`bash
npm run dev
\`\`\`

Visit **http://localhost:3000** in your browser.
`
  },
  {
    path: 'package.json',
    language: 'json',
    description: 'Project dependencies and scripts.',
    content: `{
  "name": "calist-meeting-prep-agent",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build",
    "start": "tsx server.ts"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "jszip": "^3.10.2",
    "lucide-react": "^0.546.0",
    "react": "^19.0.1",
    "react-dom": "^19.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.1",
    "tailwindcss": "^4.3.3",
    "tsx": "^4.21.0",
    "typescript": "^7.0.2",
    "vite": "^8.3.0"
  }
}
`
  },
  {
    path: '.env.example',
    language: 'bash',
    description: 'Environment variables template.',
    content: `# Optional: Google Gemini API key for dynamic AI chat & brief generation
GEMINI_API_KEY=""

# Application Port
PORT=3000
`
  },
  {
    path: 'server.ts',
    language: 'typescript',
    description: 'Backend Express server handling Auth, Meetings, Profile, Notifications, and Calendar Sync.',
    content: `// Refer to root server.ts for complete API routes and PBKDF2 authentication endpoints.
`
  }
];
