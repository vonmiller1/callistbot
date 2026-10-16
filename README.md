# Calist - AI Meeting Prep & Workspace Intelligence

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
   ```bash
   npm install
   ```
2. (Optional) Set your `GEMINI_API_KEY` in `.env`:
   ```bash
   cp .env.example .env
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.
