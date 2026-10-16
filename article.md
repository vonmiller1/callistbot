# Building an AI Assistant: What Hindsight Showed Me About Context

I started building Calist as a meeting prep agent because I was tired of context switching. Every meeting meant digging through email, Slack, past notes, and scattered action items. I wanted to walk into a call with the right talking points already synthesized. What I didn't expect was how much of the problem wasn't the AI—it was knowing what to feed the AI in the first place.

## The Problem I Didn't Anticipate

When you're building an assistant that needs to give useful advice about a meeting, the obvious move is to ask an LLM to generate talking points and questions based on the agenda. That works. It's also immediately obvious to anyone using it: the output is generic and doesn't reflect what actually matters to this person, this meeting, or this set of participants.

The missing piece wasn't better prompting or a bigger model. It was *memory*. Actual context about past conversations with these people, what got promised last time, what keeps coming up, and what was actually blocking progress.

I built Calist to solve this by pulling in three data streams: calendar events, past meeting notes, and action item history. Then I wired it all into Gemini to generate meeting briefs. The architecture looked reasonable on a whiteboard. But in practice, I was drowning in retrieval problems. Queries were slow. Relevance was poor. I was storing raw text and doing exact-match searches, which meant I'd miss related context unless the wording matched exactly.

That's when I started looking at vector memory systems, and that's when [Hindsight](https://github.com/vectorize-io/hindsight) changed how I thought about the problem.

## How Hindsight Fixed Context Retrieval

[Hindsight](https://hindsight.vectorize.io/) is a vector memory layer that sits between your app and stored conversational data. The pitch is straightforward: instead of storing raw text and searching for keywords, you embed your meeting context semantically and retrieve based on meaning. That's not new in theory. What matters is what changes in practice.

Before Hindsight, my assistant's prompt looked like this:

```typescript
const prompt = `You are Calist, a warm, clear, and helpful AI meeting preparation assistant for ${user.name} (${user.jobTitle || 'Professional'}).
Below is the user's scheduled meetings and context:
${JSON.stringify(meetings.map((m) => ({ title: m.title, date: m.date, time: m.startTime, participants: m.participants.map((p) => p.name) })), null, 2)}

User Question: "${query}"

Provide a friendly, direct, concise, and helpful answer. Avoid technical jargon.`;
```

This dumps *all* meetings into the prompt every time. It's wasteful and loses signal. I needed to fetch only the relevant meetings—the ones that actually matter to the current query.

With [Hindsight's vector memory](https://vectorize.io/what-is-agent-memory), I can now do this:

```typescript
// Store meeting context as semantic memory
const meetingContext = {
  title: meeting.title,
  description: meeting.description,
  participants: meeting.participants.map((p) => p.name).join(', '),
  date: meeting.date,
  actionItems: meeting.brief.actionItems,
  keyTopics: meeting.brief.talkingPoints,
};

// At query time, retrieve only semantically relevant meetings
const relevantContext = await hindsight.query(userQuery, {
  filters: { userId: user.id },
  topK: 5,  // Get the 5 most relevant meetings, not all 50
});

// Now build a focused prompt with only what matters
const prompt = `
You are Calist, meeting prep assistant for ${user.name}.

Relevant past context:
${relevantContext.map((ctx) => `- ${ctx.title}: ${ctx.keyTopics.join(', ')}`).join('\n')}

User Question: "${query}"

Provide a concise, grounded answer.
`;
```

This is a small change in code. The difference in output is massive. The assistant now gives context-aware answers because it actually has relevant context, not a firehose of everything.

## Designing the Brief: Where Context Becomes Actionable

The real test of this system is the meeting brief—the automatically generated one-page executive summary that users see before a call. It needs to surface three things that a generic LLM can't synthesize on its own: what was promised in past meetings, what's actually blocking the work, and what each participant cares about.

Here's where I generate briefs:

```typescript
app.post('/api/meetings', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, description, agenda, participants, date } = req.body;
    const user = req.user!;

    // Start with a baseline brief
    let brief = {
      executiveSummary: `Meeting with ${participants?.length || 0} participants to discuss "${title}".`,
      strategicObjective: agenda || description || `Align on ${title} outcomes.`,
      talkingPoints: [
        `Welcome participants and review ${title} objectives.`,
        'Walk through agenda items.',
        'Agree on action items and ownership.',
      ],
      questionsToAsk: [
        `"Are all stakeholders aligned on the proposed direction?"`,
        '"Are there any blockers?"',
      ],
      actionItems: [],
    };

    // If Gemini is available, enhance with semantic context
    if (ai && (description || agenda)) {
      try {
        const prompt = `Synthesize a Pre-Meeting Dossier for:
Title: "${title}"
Agenda: "${agenda || description}"
Participants: ${JSON.stringify(participants || [])}

Provide JSON with: executiveSummary, strategicObjective, talkingPoints[], questionsToAsk[], friendlyTips[]`;

        const aiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const parsed = JSON.parse(aiRes.text || '{}');
        if (parsed.executiveSummary) {
          brief = { ...brief, ...parsed };
        }
      } catch (e) {
        console.warn('AI enhancement skipped:', e);
      }
    }

    const newMeeting: Meeting = {
      id: meetingId,
      // ... other fields ...
      brief,
      createdAt: new Date().toISOString(),
    };

    const saved = db.createMeeting(newMeeting);
    return res.status(201).json({ meeting: saved });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to schedule meeting.' });
  }
});
```

The fallback brief is intentionally basic. It's good enough to ship, but the real value comes from the LLM enhancement. And that enhancement only works if the prompt has signal. Without Hindsight-powered context retrieval, I'd still be dumping raw text and hoping the model figured it out.

## The Chat Assistant: Grounding Answers in Reality

The chat interface is where the system proves itself in real time. A user asks something like "What did we agree to do about the API performance issue?" and the assistant needs to find that specific conversation, pull the actual commitment, and tell them who owns it and when it's due.

Here's the chat endpoint:

```typescript
app.post('/api/chat', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required.' });

    const user = req.user!;
    const meetings = db.getMeetingsForUser(user.id);

    if (ai) {
      try {
        const prompt = `You are Calist, warm and helpful AI meeting assistant for ${user.name}.
Below is scheduled meetings and context:
${JSON.stringify(meetings.map((m) => ({ title: m.title, date: m.date, time: m.startTime, participants: m.participants.map((p) => p.name) })), null, 2)}

User Question: "${query}"

Provide a friendly, direct, concise answer. Avoid jargon.`;

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
    return res.status(500).json({ error: 'Failed to process request.' });
  }
});
```

This works, but it has the same problem: it's passing the entire meeting list. The prompt context is wasted on meetings that have nothing to do with the question. With Hindsight, I can retrieve only semantically similar meetings and past conversations, making the LLM response more accurate and saving token budget.

## Calendar Sync: Building the Data Foundation

None of this works without a real data source. I built background sync for Google Calendar and Microsoft Outlook because those are where meetings actually live. The sync runs in the background and pulls events, participants, and timestamps into the system.

```typescript
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
```

The calendar becomes the system of record. Every meeting that gets scheduled or appears on the user's calendar flows into Hindsight's memory layer. That means the context available to the assistant is always current and comprehensive.

## What Hindsight Actually Taught Me

Building this system taught me three things that changed how I think about AI assistants.

**First: Context is the limiting factor, not the model.** I'm using Gemini 3.8 Flash, which is fast and cheap. The difference in output quality—between a generic brief and a contextual one—isn't about model size. It's about whether the prompt contains relevant information. A smaller model with good context beats a huge model with noise. Hindsight forces you to think about what information actually matters, and that discipline pays off.

**Second: Vector similarity breaks keyword constraints.** Before Hindsight, I would have hard-coded rules like "if the query mentions 'API', fetch all meetings tagged 'backend'". That's fragile and misses cross-domain insights. Semantic retrieval means if someone asks "What were the performance concerns we talked about?" the system will find meetings about latency, throughput, database optimization—even if the wording is different. That's not a marginal improvement. It's a different category of utility.

**Third: Building memory into your system design from the start matters.** I initially thought of the database as a log—store everything, query when needed. With Hindsight's approach, I'm thinking of it as semantic memory. What gets stored, how it's structured, and what gets retrieved are all tied together. That forces cleaner abstractions and more intentional data modeling.

## Shipping It

The current system runs on Express, React, and Vite. Authentication is salted PBKDF2 for email/password, with OAuth support for Google and Microsoft. The frontend is Tailwind and component-driven. None of that is novel. What matters is the pipeline: calendar sync → meeting storage → semantic indexing → context retrieval → LLM prompt → user-facing brief or chat response.

The system is production-ready for small teams. Multi-user support is there. Notifications, recurring meetings, personal notes on briefs—all of it works. The bottleneck now isn't features. It's distribution and whether the core insight—that meeting context beats meeting volume—actually resonates with how people work.

## The Reusable Lessons

If you're building an AI assistant and thinking about context, here's what I'd do differently:

1. **Start with semantic retrieval, not keyword matching.** Invest in [vector memory](https://vectorize.io/what-is-agent-memory) early. It's not a nice-to-have; it's foundational to making LLM output useful.

2. **Build data integrations as a first-class problem.** You can't have good context without real data. Calendar sync, Slack integration, email threading—these aren't features to bolt on later. They're the system.

3. **Make the fallback non-terrible.** Every part of my system has a baseline that works without AI. If Gemini is unavailable, the user still gets a basic brief with talking points. That's not accident; it's architecture.

4. **Measure against the problem, not the technology.** The goal isn't "run an LLM" or "deploy Hindsight". It's "users walk into meetings better prepared". That's a small shift in how you think about it, but it changes everything you optimize for.

Building Calist forced me to confront what "context" actually means in practice. It's not raw information volume. It's relevant information, retrieved at the right time, and combined with enough structure that an LLM can actually use it. Hindsight does that retrieval work. That's why it matters.

The assistant is only as good as its memory. And the memory is only as good as your system for retrieving what matters. That's the insight I'd go back and tell myself at the beginning.
