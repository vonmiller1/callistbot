# My Meeting Agent Had Amnesia. Hindsight Was the Cure

For the first few months, my meeting prep agent introduced me to people I had been on calls with every week for a year. It would draft a confident pre-meeting brief for Sarah, our champion on a $240k deal, and never mention that she had told me, twice, that she hard-stops at 2:30 PM. The model was fine. The memory was the problem, because there wasn't any.

This is the story of how I fixed that, why I stopped stuffing calendar JSON into prompts, and what changed once the agent could remember things the way a colleague does.

## What the system does

Calist is a meeting prep tool. It connects to Google Calendar and Outlook, syncs events in the background, and produces a one-page brief before each meeting: an executive summary, a strategic objective, talking points, questions to ask, and tips for the specific people in the room. There is also a chat pane where I can ask things like "what did I promise the Vantage team?"

The shape is boring on purpose:

- A React 19 + Vite frontend (dashboard, meeting detail view, a "People & Habits" screen, an assistant chat pane).
- An Express server in TypeScript that owns auth, meetings, calendar integrations, and the two LLM-facing endpoints: `POST /api/meetings` (which generates a brief when you schedule) and `POST /api/chat`.
- A small persistence layer for users, meetings, contacts, notifications, and integration state.
- Gemini for generation, called server-side.

The interesting part is not any of that. It is what the LLM is allowed to know when it writes a brief.

## The original design, and why it broke

My first version treated context as a query-time problem. When a user asked a question, the server loaded their meetings, serialized them, and pasted them into the prompt. This is the actual shape of the chat endpoint:

```ts
const meetings = db.getMeetingsForUser(user.id);

const prompt = `You are Calist, a warm, clear, and helpful AI meeting preparation assistant for ${user.name} (${user.jobTitle || 'Professional'}).
Below is the user's scheduled meetings and context:
${JSON.stringify(meetings.map((m) => ({ title: m.title, date: m.date, time: m.startTime, participants: m.participants.map((p) => p.name) })), null, 2)}

User Question: "${query}"
...`;
```

Look at what is in that payload: titles, dates, times, participant names. That is a calendar, not knowledge. Nothing in it says what was decided, what was promised, or how anyone likes to work. The model could tell me I had a call with Dave Chen on Thursday. It could not tell me that Dave only needs the staging link to sign off on security.

The "People & Habits" feature had the opposite problem. The habits were a typed object, filled in by hand:

```ts
export interface ContactBehavioralHabits {
  preferredMeetingTime: string;
  preferredDays: string[];
  meetingPunctualityScore: number;
  commsStyle: string;
  meetingDurationPreference: string;
  optimalPrepTip: string;
}
```

Six fixed fields per contact. That schema is a decision I made before I had learned anything about anyone. `meetingPunctualityScore` as a number is a good example: it looks precise, but something has to compute it, and something has to decide when it changes. Nothing did. It was a lookup table pretending to be observation.

So I had two stores that both failed in opposite directions. The calendar JSON had breadth and no meaning. The habits object had meaning and no breadth, and neither one learned anything from the meetings that had already happened.

I could see two ways out. One was to keep growing the prompt: more history, longer summaries, more fields. I tried this briefly and it degraded in the way you would expect. The prompt got long, the relevant facts got buried, and every new field in `ContactBehavioralHabits` meant a migration and a UI change. The other was to stop treating memory as something I assemble by hand.

## Why I moved memory out of the prompt and into Hindsight

I wanted a separate memory layer that could ingest raw text (meeting notes, agenda text, the things I typed after a call), extract facts, and hand back only what is relevant to a question. I did not want to build an extraction pipeline, an embedding store, and a retrieval ranker. That is a project on its own, and it is not the product.

I ended up using [Hindsight, an open-source agent memory system](https://github.com/vectorize-io/hindsight). The [Hindsight documentation](https://hindsight.vectorize.io/) frames the API around a small set of operations, and the ones I use are retain, recall, and reflect. If you want the broader background on why this category exists, Vectorize has a decent explainer on [what agent memory is](https://vectorize.io/what-is-agent-memory). I will not repeat it here, but the short version is that a context window is a scratchpad, not a memory.

The design decision that mattered most was how to carve up memory banks. I gave each user their own bank, and I write every fact into it tagged with the people and the meeting it came from. That gives me isolation between users by construction, and it means "everything I know about Dave" is a retrieval question instead of a schema question.

## Writing memories: retain on the events that carry information

The retain path is deliberately dull. Three things get written into a user's bank:

1. Meeting notes the user edits in the details modal.
2. Post-meeting recaps and action items (each `actionItem` has an assignee, a due date, and a status).
3. Observations about how attendees behave: who joined late, who asked for a shorter slot, who said no to a Monday.

The point of retain is that I pass in prose, the way a human would write it, and let the memory layer worry about structure:

```ts
async function rememberMeeting(user: User, meeting: Meeting, notes: string) {
  const attendees = meeting.participants.map((p) => p.name).join(', ');

  await hindsight.retain(bankFor(user.id), {
    content: [
      `Meeting: ${meeting.title} on ${meeting.date} at ${meeting.startTime} (${meeting.timezone}).`,
      `Attendees: ${attendees}.`,
      `Notes from ${user.name}: ${notes}`,
    ].join('\n'),
    context: `calendar-meeting:${meeting.id}`,
  });
}
```

I want to be honest about one thing that was painful. My first instinct was to normalize before writing: parse the notes, pull out a "punctuality" number, update the contact. That is exactly the schema-first thinking that got me into trouble. Retaining raw, timestamped text and deferring interpretation to recall time turned out to be much less brittle, because I can change what I ask without rewriting anything I have already stored.

## Reading memories: recall before generation

The two LLM endpoints are where it pays off. The change to `/api/chat` is small. Instead of dumping the calendar, the server first asks the memory layer what is relevant to this specific question, and only then builds the prompt:

```ts
app.post('/api/chat', requireAuth, async (req, res) => {
  const { query } = req.body;
  const user = req.user!;

  const memories = await hindsight.recall(bankFor(user.id), { query });

  const prompt = `You are Calist, a meeting preparation assistant for ${user.name}.
Relevant things you already know:
${memories.map((m) => `- ${m.text}`).join('\n')}

Upcoming meetings (titles and times only):
${JSON.stringify(upcomingMeetings(user.id))}

Question: "${query}"
Answer directly. If the memories don't cover it, say so.`;

  // ...same Gemini call as before
});
```

Two details in there are worth pointing out. The calendar is still in the prompt, but it is demoted to what it always should have been: a list of titles and times. And I added the last line on purpose. A memory-backed assistant that confidently fills gaps is worse than one that says it does not know, because now the user trusts it more.

The brief generator in `POST /api/meetings` got the same treatment. Previously it had two inputs: the title and the agenda. The generation prompt now also receives recalled memories for each participant, so the "talking points" and "friendly tips" fields stop being generic advice like "check audio/video 2 minutes before the call" and start reflecting what I actually know about the people involved.

```ts
const perPerson = await Promise.all(
  (participants || []).map((p: Participant) =>
    hindsight.recall(bankFor(user.id), {
      query: `What should I know before meeting ${p.name}? Preferences, past commitments, open issues.`,
    })
  )
);
```

Recall on a per-participant question is the right granularity. A single query for the whole meeting returned a blend of everyone and favored whoever I had written the most notes about.

## Where I use reflect

`recall` gives me facts. Some questions are not fact lookups. "Analyze Elena's meeting habits and prep strategy" is what the People & Habits screen sends when you click the button on a contact. That is a synthesis question, and it is a better fit for reflect than for stitching recalled snippets into a prompt myself. The habit cards on that screen are now generated from what has been observed, not from a hand-maintained struct. The six fields still exist, but they are a rendering of memory, not the source of truth. If Elena starts declining Monday brainstorms, the card changes the next time I look at it, and I did not write a migration for that.

## What it looks like in use

These are the kinds of exchanges I use to sanity check the system. None of them are possible with the calendar-only prompt.

**Before** (calendar JSON only):

> **Me:** What's the deal with Sarah's budget?
> **Calist:** You have a call with Sarah Jenkins on Thursday. Would you like me to summarize it?

**After** (recall in the loop):

> **Me:** What's the deal with Sarah's budget?
> **Calist:** Sarah approved the annual tier for 250 seats. She still wants confirmation on uptime guarantees, and she has a hard stop at 2:30 PM, so lead with the confirmation and skip the intro slides.

And for scheduling:

> **Me:** Set up time with Elena this week.
> **Calist:** Elena tends to prefer mornings and open brainstorms. Tuesday around 10:00 has room, and she has usually been happy with a friendly, unstructured format.

I am deliberately not putting numbers on any of this. I have not measured "brief quality" in a way I would defend on Hacker News, and I do not think a satisfaction score I made up would help anyone. What I can say is that the failure I started with, introducing me to my own clients, stopped happening, and that is easy to verify: the answer either contains the fact or it does not.

## Things that still hurt

- **Bad memories are worse than no memories.** If I write a wrong note, it will be recalled with the same confidence as a right one. I now show the user which memories informed a brief, so a wrong one can be spotted and corrected.
- **Retain is only as good as what I feed it.** Calendar events alone carry almost no information. The value comes from notes and recaps, which means the product has to make writing them cheap.
- **Per-user banks are simple, but shared context is not.** Two people at the same company meet the same client. Right now each bank learns separately. That is the correct privacy default and an obvious limitation.
- **Latency.** Recall adds a network hop before every generation. For chat I stream the answer; for briefs generated at schedule time it does not matter.

## Lessons learned

1. **Don't confuse a calendar with memory.** Titles, times, and participant lists tell an agent when things happen, not what they meant. If your prompt is mostly event metadata, your agent is still amnesiac.
2. **Delay schema decisions.** A typed `ContactBehavioralHabits` felt tidy, and it froze my assumptions about people before I had learned anything about them. Store raw observations, and derive the structure at read time.
3. **Recall at the granularity of the question.** Per-person queries beat one big meeting-level query. Retrieval quality depends on the question you ask as much as on the store.
4. **Make "I don't know" a first-class answer.** Once an agent has memory, the temptation is to let it fill in gaps. Tell it explicitly to say when memory doesn't cover something.
5. **Use a memory layer instead of writing your own.** Extraction, embedding, and ranking are all solved problems that I did not want to re-solve. I would rather spend that time on the parts of the product users can see. If you want to look under the hood, the [Hindsight repository](https://github.com/vectorize-io/hindsight) is where I started reading.

The agent I ship today is not smarter than the one that kept introducing me to Sarah. It uses the same model and roughly the same prompts. It just remembers what happened last time, which turns out to be most of what "prepared" means.


<img width="1600" height="759" alt="WhatsApp Image 2026-09-29 at 7 48 03 PM" src="https://github.com/user-attachments/assets/147c7b48-758e-4ea2-b16d-5453dde7dcb1" />

<img width="1600" height="765" alt="WhatsApp Image 2026-09-29 at 7 41 55 PM" src="https://github.com/user-attachments/assets/16ccf172-d3ea-4b51-9bff-4ea2e6841aab" />


<img width="1901" height="903" alt="image" src="https://github.com/user-attachments/assets/a639a1db-ec47-4417-8306-acac91d2e484" />

<img width="1895" height="907" alt="image" src="https://github.com/user-attachments/assets/e821e7a6-1624-4cc4-8b42-71d0ccae7bef" />




<img width="1600" height="849" alt="WhatsApp Image 2026-09-29 at 7 50 01 PM" src="https://github.com/user-attachments/assets/2d3c650d-0bd6-41cd-b121-10815a968626" />

<img width="1905" height="1015" alt="image" src="https://github.com/user-attachments/assets/f950ee05-3cb6-4b34-95d0-0d4230e45901" />
