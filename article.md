# My Meeting Agent Had Amnesia. Hindsight Was the Cure

When you build a meeting preparation system, you run into a brutal constraint: context is everything. I learned this the hard way. Our AI agent would generate brilliant meeting briefs—talking points, action item summaries, attendee context—but the moment a meeting ended, it forgot what just happened. Next time you needed to reference what was discussed three meetings ago, the agent would stare blankly. It had amnesia.

We were building Calist, an autonomous meeting prep system that synthesizes calendar data, meeting histories, and team context to generate one-click executive briefs. The product worked in isolation: create a meeting, get a brief with talking points and action items. But the real pain point—helping you remember what actually happened across your entire meeting lifecycle—felt out of reach without persistent, queryable memory. We needed to move beyond ephemeral session context into something durable and searchable.

## The Problem: Stateless Briefs

Here's how our original system worked. A user schedules a meeting through our REST API. The backend receives the meeting payload and immediately generates a brief:

```typescript
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
```

Then, if Gemini is available, we enhance the brief with AI:

```typescript
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
```

This worked fine for *preparing* for meetings. But here's the catch: once the brief was stored, that was it. If you had three meetings with the same stakeholder, each brief was isolated. The AI had no way to say, "Last time you talked to Sarah, she committed to reviewing the Q3 budget—have you gotten that from her yet?" Every meeting started from scratch.

The user experience reflected this. When you opened the dashboard, you'd see today's meetings and their pre-generated briefs. But there was no thread of understanding across meetings. No persistent institutional knowledge. The agent wasn't learning. It wasn't tracking. It was just generating briefs into the void.

## Why This Matters

Meeting prep isn't just about generating talking points. The real value is in *continuity*. Sales reps live in continuity—they track what promises a prospect made last call, where objections came from, who said what. Executives juggle dozens of relationships and need to remember who committed to what. Teams need to track action items across multiple touchpoints with the same people.

Without continuity, your AI agent becomes a tool that generates boilerplate. With continuity, it becomes something that actually understands your relationships and commitments.

Our first instinct was to just store more data—save every brief, every note, every action item—and then query it when generating new briefs. But that creates a new problem: how do you *find* the right context when you need it? If you have 200 meetings and 50 of them involved Sarah Chen, how does the AI know which details from those past interactions are relevant to your upcoming call with Sarah? Simple keyword search would drown you in noise.

## The Hindsight Solution

This is where [Hindsight](https://github.com/vectorize-io/hindsight) came in. Hindsight is an open-source vector memory layer that sits on top of Cloudflare Vectorize. The core idea is deceptively simple: take your unstructured data—meeting briefs, notes, action items, attendee profiles—convert it to embeddings, and store it in a vector database. When you need context, you query by *semantic meaning*, not exact keywords.

For Calist, this meant rearchitecting how we handle meeting context. Instead of the agent having a short-term, stateless view of each meeting, we built a persistent vector store that tracks:

- **Past meeting briefs** with all participants
- **Completed and pending action items** tied to people and projects
- **Stakeholder contact profiles** and interaction history
- **Commitment tracking** across multiple touchpoints

When generating a new brief, the agent now queries Hindsight with a semantic search: "What has this user discussed with Sarah Chen before? What did Sarah commit to? What did we learn about her communication style?" The vector database returns the most relevant snippets from past interactions, and those get stitched into the new brief as contextual frames.

Here's what that flow looks like in practice:

```typescript
// Instead of: "Generate a brief for a meeting with Sarah Chen"
// We now do: "Generate a brief for a meeting with Sarah Chen,
// contextually grounded in prior interactions"

const userMeetings = db.getMeetingsForUser(user.id);
const briefContext = userMeetings.map((m) => ({
  title: m.title,
  date: m.date,
  time: m.startTime,
  participants: m.participants.map((p) => p.name),
}));

const prompt = `You are Calist, a warm, clear, and helpful AI meeting preparation assistant for ${user.name}.
Below is the user's scheduled meetings and context:
${JSON.stringify(briefContext, null, 2)}

User Question: "${query}"

Provide a friendly, direct, concise, and helpful answer.`;
```

With Hindsight, this query context becomes *vector-enriched*. We're not just passing the structured meeting list; we're embedding semantic summaries of past interactions and letting the vector search surface the most relevant ones. If Sarah Chen tends to be skeptical about timelines, Hindsight retrieves meeting notes where that pattern emerged. If the team committed to delivering a prototype by a certain date, Hindsight finds that commitment and flags it as relevant context for the upcoming call.

## What Changed

The shift from stateless to stateful memory had cascading effects on the product:

**1. Briefings became context-aware.** The generated talking points now reference specific previous commitments or concerns, not generic prompts. "Recap progress on the Q3 roadmap—last time Sarah expressed concern about the timeline" is vastly more useful than "Discuss roadmap progress."

**2. Action item tracking became automatic.** Instead of manually logging "Sarah will review the budget," the vector memory tracks this commitment across time. When the next meeting with Sarah comes up, the brief surfaces pending items tied to her. If the item is overdue, it's flagged.

**3. Attendee intelligence became actionable.** We built contact "habit profiles" that track communication patterns. The agent learns whether someone prefers async communication, tends to dominate discussions, always commits to more than they deliver, or is a blocker for certain decision types. This is [agent memory](https://vectorize.io/what-is-agent-memory) at work—the system becomes smarter about individuals, not just meetings.

**4. Discovery became search instead of manual triage.** "Show me all commitments Sarah made in the last 90 days" or "Which stakeholders said they'd adopt our new process?" now return accurate results. The vector search understands intent, not just keywords.

## The Technical Reality

Hindsight runs on Cloudflare Vectorize, which means embeddings are computed once and queried efficiently at the edge. For a meeting prep agent, this matters because you generate briefs in real-time—a user opens their calendar, clicks on a meeting, and the brief loads in seconds. We can't afford to wait for model inference. Precomputed embeddings stored in a vector database solve that.

The integration looked like this: whenever we create or update a meeting, we also push a serialized summary to Hindsight. The vector database assigns embeddings automatically. When generating a new brief, we query Hindsight with a semantic query about the attendees and context, get back the closest matches, and feed those matches to Gemini as enriched context.

The cost is minimal—vector storage is cheap compared to the latency and accuracy gains. The safety is high—we store meeting data in the same ecosystem, no data leaks to external APIs. The speed is perceptible—users see relevant prior context loaded instantly.

## Lessons Learned

**1. Stateless agents are fine for one-off tasks. They're terrible for relationship management.** A meeting prep agent that forgets between meetings is like a salesperson with amnesia. Context is the product. Everything else is just presentation.

**2. Vector search is not a luxury—it's a primitive.** Once we had persistent memory, semantic search became the obvious way to query it. Keyword search would have forced us to ask users exactly the right questions and remember the right terminology. Vector search lets us understand intent.

**3. Persistence changes the incentive structure.** When the agent knows you'll remember what you committed to, it changes how you use it. You're less likely to make throwaway promises. You're more likely to actually follow through. The tool becomes accountable.

**4. Memory needs to be integrated, not bolted on.** We didn't add Hindsight as an afterthought. We redesigned the entire brief generation flow around persistent, queryable memory. When you try to retrofit memory, you end up with weird seams and edge cases.

**5. Vector databases are infrastructure, not magic.** [Hindsight](https://hindsight.vectorize.io/) works because it's boring infrastructure. It stores vectors, it retrieves vectors, it does it fast. There's no black magic. The magic is in how you use the retrieved context—in our case, stitching it into prompts that matter to real meetings.

The amnesia was real. The cure was persistence—not just storing data, but storing it in a way that lets an agent remember what matters. Calist now understands your relationships. It tracks your commitments. It surfaces critical context before calls. The meetings still happen. But now the agent learns from them.




<img width="1600" height="759" alt="WhatsApp Image 2026-09-29 at 7 48 03 PM" src="https://github.com/user-attachments/assets/147c7b48-758e-4ea2-b16d-5453dde7dcb1" />

<img width="1600" height="765" alt="WhatsApp Image 2026-09-29 at 7 41 55 PM" src="https://github.com/user-attachments/assets/16ccf172-d3ea-4b51-9bff-4ea2e6841aab" />


<img width="1901" height="903" alt="image" src="https://github.com/user-attachments/assets/a639a1db-ec47-4417-8306-acac91d2e484" />

<img width="1895" height="907" alt="image" src="https://github.com/user-attachments/assets/e821e7a6-1624-4cc4-8b42-71d0ccae7bef" />




<img width="1600" height="849" alt="WhatsApp Image 2026-09-29 at 7 50 01 PM" src="https://github.com/user-attachments/assets/2d3c650d-0bd6-41cd-b121-10815a968626" />

<img width="1905" height="1015" alt="image" src="https://github.com/user-attachments/assets/f950ee05-3cb6-4b34-95d0-0d4230e45901" />





