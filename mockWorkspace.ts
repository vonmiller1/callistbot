import { Contact, IntegrationAccount, Meeting } from '../types';

export const INITIAL_INTEGRATIONS: IntegrationAccount[] = [
  {
    id: 'int-google',
    provider: 'google',
    name: 'Google Workspace',
    category: 'calendar',
    accountEmail: 'alex.rivera@work.com',
    status: 'connected',
    lastSyncedAt: '5 mins ago',
    description: 'Syncs your Google Calendar meetings and important email threads.'
  },
  {
    id: 'int-microsoft',
    provider: 'microsoft',
    name: 'Microsoft 365',
    category: 'email',
    accountEmail: 'alex.rivera@outlook.com',
    status: 'connected',
    lastSyncedAt: '12 mins ago',
    description: 'Syncs Outlook appointments and Microsoft Teams notes.'
  },
  {
    id: 'int-slack',
    provider: 'slack',
    name: 'Slack',
    category: 'chat',
    accountEmail: 'alex@workplace.slack.com',
    status: 'connected',
    lastSyncedAt: 'Just now',
    description: 'Pulls recent channel announcements and team updates.'
  },
  {
    id: 'int-zoom',
    provider: 'zoom',
    name: 'Zoom Meetings',
    category: 'video',
    accountEmail: 'alex.rivera@work.com',
    status: 'connected',
    lastSyncedAt: '1 hour ago',
    description: 'Connects your scheduled Zoom calls and meeting links.'
  },
  {
    id: 'int-hubspot',
    provider: 'hubspot',
    name: 'HubSpot CRM',
    category: 'crm',
    accountEmail: 'sales@work.com',
    status: 'connected',
    lastSyncedAt: '30 mins ago',
    description: 'Keeps client details, deal status, and notes up to date.'
  },
  {
    id: 'int-linear',
    provider: 'linear',
    name: 'Linear Tasks',
    category: 'tasks',
    accountEmail: 'alex@work.com',
    status: 'connected',
    lastSyncedAt: '20 mins ago',
    description: 'Tracks pending team to-dos and project commitments.'
  }
];

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'cnt-sarah-jenkins',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@vantage.com',
    role: 'VP of Commercial Strategy',
    company: 'Vantage BioTech',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    lastContacted: 'Yesterday at 4:15 PM',
    habits: {
      preferredMeetingTime: 'Afternoons (1:30 PM – 4:00 PM)',
      preferredDays: ['Tuesday', 'Thursday'],
      meetingPunctualityScore: 98,
      commsStyle: 'Clear, direct, and values quick summaries',
      meetingDurationPreference: 'Prefers 25–30 min quick syncs',
      optimalPrepTip: 'Keep intro small talk under 1 minute. Sarah has a tight schedule and appreciates getting straight to key decisions.'
    }
  },
  {
    id: 'cnt-marcus-vance',
    name: 'Dr. Marcus Vance',
    email: 'm.vance@vantage.com',
    role: 'Head of Research & Technology',
    company: 'Vantage BioTech',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    lastContacted: '2 days ago',
    habits: {
      preferredMeetingTime: 'Late afternoons (3:00 PM – 5:00 PM)',
      preferredDays: ['Monday', 'Wednesday'],
      meetingPunctualityScore: 88,
      commsStyle: 'Detail-oriented and hands-on',
      meetingDurationPreference: 'Appreciates 45 min deep dives',
      optimalPrepTip: 'Avoid long slide decks. Marcus prefers live walkthroughs and real examples over slides.'
    }
  },
  {
    id: 'cnt-dave-chen',
    name: 'Dave Chen',
    email: 'dave.chen@vantage.com',
    role: 'Head of IT & Security',
    company: 'Vantage BioTech',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    lastContacted: '3 days ago',
    habits: {
      preferredMeetingTime: 'Mornings (10:00 AM – 11:30 AM)',
      preferredDays: ['Tuesday', 'Wednesday'],
      meetingPunctualityScore: 95,
      commsStyle: 'Practical, concise bullet points',
      meetingDurationPreference: 'Quick 20–30 min focus',
      optimalPrepTip: 'Dave focuses on privacy, logins, and checklist confirmation. Share direct links.'
    }
  },
  {
    id: 'cnt-elena-rostova',
    name: 'Elena Rostova',
    email: 'elena.rostova@apex.io',
    role: 'Product Director',
    company: 'Apex Systems',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
    lastContacted: 'Yesterday at 11:30 AM',
    habits: {
      preferredMeetingTime: 'Mornings (9:30 AM – 11:30 AM)',
      preferredDays: ['Tuesday', 'Thursday'],
      meetingPunctualityScore: 92,
      commsStyle: 'Warm, collaborative, and friendly',
      meetingDurationPreference: '30–45 mins',
      optimalPrepTip: 'Elena loves collaborative brainstorming and quick mutual feedback.'
    }
  }
];

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'mtg-vantage-q4-review',
    organizerId: 'usr-default',
    organizerName: 'Sarah Jenkins',
    organizerEmail: 'sarah.j@vantagebiotech.com',
    organizer: 'Sarah Jenkins',
    title: 'Vantage BioTech Contract Review & Next Steps',
    description: 'Executive contract review and technical architecture signoff for the Vantage BioTech enterprise agreement.',
    agenda: '1. Review test SSO link with Dave Chen\n2. Demonstrate 1.1s benchmark speed to Dr. Vance\n3. Final agreement sign-off with Sarah',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '14:30',
    scheduledTime: new Date(Date.now() + 1000 * 60 * 35).toISOString(),
    timeDisplay: 'Today at 2:00 PM (in 35 mins)',
    timezone: 'America/New_York',
    durationMinutes: 30,
    platform: 'Zoom',
    status: 'confirmed',
    meetingUrl: 'https://zoom.us/j/8492019381',
    meetingLink: 'https://zoom.us/j/8492019381',
    reminder: {
      enabled: true,
      timeBeforeMinutes: 15,
      label: '15 minutes before',
    },
    participants: [
      { id: 'part-1', name: 'Sarah Jenkins', email: 'sarah.j@vantagebiotech.com', role: 'VP Commercial Strategy', responseStatus: 'accepted' },
      { id: 'part-2', name: 'Dr. Marcus Vance', email: 'm.vance@vantagebiotech.com', role: 'Head of Technology', responseStatus: 'accepted' },
      { id: 'part-3', name: 'Dave Chen', email: 'd.chen@vantagebiotech.com', role: 'Head of IT & Security', responseStatus: 'accepted' }
    ],
    attendees: [
      MOCK_CONTACTS[0], // Sarah Jenkins
      MOCK_CONTACTS[1], // Dr. Marcus Vance
      MOCK_CONTACTS[2]  // Dave Chen
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    brief: {
      id: 'brief-1',
      meetingId: 'mtg-vantage-q4-review',
      generatedAt: 'Just now',
      executiveSummary: 'Sarah has approved the $240k annual plan for 250 team seats. Today\'s 30-minute sync is to give Dave Chen a quick look at the single sign-on setup and confirm smooth speed for Dr. Vance before signing.',
      strategicObjective: 'Confirm the two technical checklist items in the first 15 minutes, then get Sarah\'s green light to send the agreement.',
      participants: [
        {
          contactId: 'cnt-sarah-jenkins',
          name: 'Sarah Jenkins',
          role: 'VP Commercial Strategy',
          statusBadge: 'Key Decision Maker',
          highlightNote: 'Budget is fully approved. Note: Sarah must leave promptly at 2:30 PM for an earnings briefing.',
          topHabitTip: 'Has a strict 30-minute stop. Keep slides away and speak directly to outcomes.'
        },
        {
          contactId: 'cnt-marcus-vance',
          name: 'Dr. Marcus Vance',
          role: 'Head of Technology',
          statusBadge: 'Technical Reviewer',
          highlightNote: 'Wants to make sure response speed is under 2 seconds. Our team tested it at 1.1s this morning.',
          topHabitTip: 'Loves seeing things live in action instead of slide presentations.'
        },
        {
          contactId: 'cnt-dave-chen',
          name: 'Dave Chen',
          role: 'Head of IT & Security',
          statusBadge: 'Security Signoff',
          highlightNote: 'Reviewed our security questionnaire; just needs confirmation of the login test link.',
          topHabitTip: 'Very punctual and likes checklist items ticked off cleanly.'
        }
      ],
      contextNotes: [
        {
          id: 'note-1',
          source: 'Email from Sarah',
          date: 'Yesterday at 3:42 PM',
          text: 'Approved the $240,000 tier for 250 seats. Please confirm uptime and test environment before today\'s call.'
        },
        {
          id: 'note-2',
          source: 'Slack update from Team',
          date: 'Today at 10:30 AM',
          text: 'The test login environment was verified this morning. Speed benchmark clocked in at 1.1s.'
        },
        {
          id: 'note-3',
          source: 'HubSpot Deal',
          date: 'Today',
          text: 'Vantage BioTech Enterprise Plan ($240k/yr). Closing target: end of this week.'
        }
      ],
      actionItems: [
        {
          id: 'act-1',
          title: 'Share the test login link with Dave Chen',
          assignee: 'Alex Rivera',
          dueDate: 'During call (first 5 mins)',
          status: 'pending'
        },
        {
          id: 'act-2',
          title: 'Show Dr. Vance the 1.1s live search speed',
          assignee: 'Alex Rivera',
          dueDate: 'During call',
          status: 'pending'
        },
        {
          id: 'act-3',
          title: 'Send final contract for signature to Sarah',
          assignee: 'Sarah Jenkins',
          dueDate: 'By tomorrow 5 PM',
          status: 'pending'
        }
      ],
      talkingPoints: [
        'Acknowledge Sarah\'s hard stop warmly: "Sarah, we know you have an earnings call right at 2:30 PM, so we\'ll keep this to 20 focused minutes."',
        'Show Dave Chen the staging login link right away for a 60-second sign-off.',
        'Show Dr. Vance the live 1.1-second search speed test so he sees the performance firsthand.',
        'Wrap up 5 minutes early to finalize agreement dispatch.'
      ],
      questionsToAsk: [
        '"Dave, does this test link give your security team everything needed?"',
        '"Marcus, how does this 1.1-second speed look for your team\'s daily research?"',
        '"Sarah, if both items are good, are you comfortable receiving the DocuSign link this afternoon?"'
      ],
      friendlyTips: [
        'Sarah leaves right at 2:30 PM — do not save the agreement discussion for the last minute.',
        'Keep Marcus engaged with a live screen demo instead of reading slides.'
      ]
    }
  },
  {
    id: 'mtg-apex-sync',
    organizerId: 'usr-default',
    organizerName: 'Elena Rostova',
    organizerEmail: 'elena@apexsystems.io',
    organizer: 'Elena Rostova',
    title: 'Apex Systems Weekly Catchup & Project Review',
    description: 'Weekly sync with Elena to review product launch timelines, marketing milestones, and shared tasks.',
    agenda: '1. Marketing milestone progress\n2. Customer case study draft quotes',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '10:30',
    scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    timeDisplay: 'Tomorrow at 10:00 AM',
    timezone: 'America/New_York',
    durationMinutes: 30,
    platform: 'Google Meet',
    status: 'confirmed',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    reminder: {
      enabled: true,
      timeBeforeMinutes: 10,
      label: '10 minutes before',
    },
    participants: [
      { id: 'part-4', name: 'Elena Rostova', email: 'elena@apexsystems.io', role: 'Product Director', responseStatus: 'accepted' }
    ],
    attendees: [
      MOCK_CONTACTS[3] // Elena Rostova
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    brief: {
      id: 'brief-2',
      meetingId: 'mtg-apex-sync',
      generatedAt: '10 mins ago',
      executiveSummary: 'Weekly friendly sync with Elena to review product launch timelines, marketing milestones, and shared tasks.',
      strategicObjective: 'Confirm design sign-offs and finalize dates for the customer case study.',
      participants: [
        {
          contactId: 'cnt-elena-rostova',
          name: 'Elena Rostova',
          role: 'Product Director',
          statusBadge: 'Project Champion',
          highlightNote: 'Very enthusiastic about collaborating on the joint case study.',
          topHabitTip: 'Enjoys open discussion and quick, collaborative alignment.'
        }
      ],
      contextNotes: [
        {
          id: 'note-apex-1',
          source: 'Slack #partnership',
          date: 'Yesterday',
          text: 'Elena mentioned the draft case study looks great, just needs two customer quote approvals.'
        }
      ],
      actionItems: [
        {
          id: 'act-apex-1',
          title: 'Review the two quotes with Elena',
          assignee: 'Alex Rivera',
          dueDate: 'Tomorrow',
          status: 'pending'
        }
      ],
      talkingPoints: [
        'Celebrate the completion of the draft customer case study.',
        'Confirm release dates for the co-marketing announcement.'
      ],
      questionsToAsk: [
        '"Elena, which launch week works best for your team\'s press schedule?"'
      ],
      friendlyTips: [
        'Mornings are Elena\'s highest energy time.'
      ]
    }
  }
];
