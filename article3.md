# My Meeting Briefs Were Stale Before the Meeting Started

I generated a brief when a meeting was scheduled. Three days later Sarah moved the call, Dave sent back the staging link, and the brief still said "confirm uptime guarantees" like nothing had happened. The brief was correct on Monday. By Thursday it was a well-formatted lie.

This post is about fixing that by changing when a brief gets written, and using [Hindsight](https://github.com/vectorize-io/hindsight) as the thing the brief reads from instead of the thing the brief is.

## What the system does

Calist syncs my calendars, and for each meeting it produces a one-page brief: an executive summary, a strategic objective, talking points, questions to ask, tips for each attendee, and action items. The server is Express in TypeScript, generation uses Gemini, and the meeting store holds a `brief` object on each meeting. Here is the shape of it:

```ts
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
```

Notice `generatedAt`. I added it early, half by instinct. It ended up being the most honest field in the type.

## The mistake: a brief is an event, not a view

In my first design, `POST /api/meetings` did everything in one request. Validate the payload, create the meeting, call the model, attach the result:

```ts
app.post('/api/meetings', requireAuth, async (req: AuthenticatedRequest, res) => {
  // ...validate title, date, participants, reminder
  // ...build a prompt from title + agenda + participant list
  // ...call Gemini, parse the JSON
  // ...store meeting with `brief` attached
});
```

That is a natural place to put it. The user just scheduled something, they want to see a brief, the data is right there. It is also the wrong place, because the moment of scheduling is the moment I know the least. The agenda is a sentence. The participants are names. Nothing has happened yet.

Then the meeting changes. My server has the routes you would expect: `PUT /api/meetings/:id`, `POST /api/meetings/:id/cancel`, and a calendar sync that can move events under me. None of them touched the brief. The status field can flip to `rescheduled` or `cancelled`, and the brief carries on describing a meeting that no longer exists.

I considered the obvious fix: regenerate the brief whenever the meeting is updated. It is cheap to write and it is wrong. Regenerating from the same thin inputs (title, agenda, names) produces a different-sounding brief with the same lack of knowledge. It also regenerates when someone corrects a typo in the title, and it throws away anything the user had edited.

## Making memory the source and the brief a projection

The change that worked was separating two things I had fused:

- **What I know** changes continuously. New notes, a recap from last week's call, a decision, a moved deadline.
- **The brief** is a rendering of what I know, for one meeting, at one moment.

If those are separate, the brief can't go stale in the same way, because the knowledge underneath it is always current and the rendering is cheap to redo.

That is where a memory layer earns its place. Everything durable goes in with `retain`, and a brief becomes a function of the recalled context, not a cached artifact. I use the [Hindsight docs](https://hindsight.vectorize.io/) vocabulary here on purpose, because the retain/recall split maps directly onto "write when something happens, read when someone needs it."

Whenever something meaningful happens to a meeting, I retain it as a plain sentence:

```ts
async function rememberChange(userId: string, before: Meeting, after: Meeting) {
  const facts: string[] = [];

  if (after.status === 'cancelled') {
    facts.push(`"${after.title}" on ${before.date} was cancelled.`);
  }
  if (before.date !== after.date || before.startTime !== after.startTime) {
    facts.push(
      `"${after.title}" moved from ${before.date} ${before.startTime} to ${after.date} ${after.startTime}.`
    );
  }
  if (facts.length === 0) return;

  await hindsight.retain(`user-${userId}`, {
    content: facts.join('\n'),
    context: `meeting-change:${after.id}`,
  });
}
```

I call that from the update and cancel handlers, and from the sync path when the diff shows a moved event. It does not touch the brief at all.

## Generating at the right time

Then the question becomes when to render. I settled on three triggers:

1. **On demand**, when the user opens the meeting detail view and the stored brief is older than the last thing I retained about that meeting or its attendees.
2. **At the reminder time.** Every meeting has a `reminder` object and the user picks `defaultReminderTime` (mine is "15 minutes before"). That is the last responsible moment to build the brief, so I build it then, from fresh recall.
3. **Never at schedule time**, except for a placeholder that says the brief will be prepared later.

The render step recalls per participant, plus one query for the meeting itself:

```ts
const [meetingContext, ...people] = await Promise.all([
  hindsight.recall(bank, { query: `${meeting.title}: decisions, open issues, commitments` }),
  ...meeting.participants.map((p) =>
    hindsight.recall(bank, { query: `What should I know before meeting ${p.name}?` })
  ),
]);
```

Those results go into the prompt, along with the meeting metadata, and out comes a brief with a fresh `generatedAt`.

## What "stale" looks like now

Staleness didn't disappear. It moved somewhere I can see it.

A brief is stale if something relevant was retained after `generatedAt`. That is a cheap check: compare the timestamp with the newest memory for this meeting's context and its attendees. The detail view shows the generation time next to a "Refresh" button, and it refreshes itself when the check fails. I would rather show a timestamp than pretend.

The moved meeting now behaves the way I wanted from the start. The change gets retained as "moved from Tuesday 2:00 to Thursday 3:30", the next render picks it up, and the brief opens with the new time. The cancelled meeting stops generating briefs at all, because the status check runs before recall.

## The things that were annoying

**Deciding what counts as relevant.** My first "is this brief stale?" check compared against any memory for any attendee. With a few busy contacts that meant nearly every brief was always stale. Scoping the check to the meeting's own context and to changes involving its attendees fixed it.

**Duplicate facts.** Sync runs repeatedly. If the same event shows up unchanged, I do not want a new memory each time. The diff step above returns early if nothing changed, and that early return is the most important line in the function.

**Lost edits.** Users edit briefs. If I regenerate over their edits, they stop trusting the feature immediately. Anything a user changes by hand becomes a retained note ("user added: ask Dave about SSO renewal") instead of an override on a cached field, so it survives every regeneration.

**Latency at the reminder.** Recall for several attendees plus a model call is not instant. Building the brief a bit before the reminder and re-checking staleness when the user opens it covers both cases.

## Takeaways

1. **A generated artifact is a cache.** If it depends on things that change, give it a timestamp and a way to be invalidated, or don't store it.
2. **Generate at the last responsible moment.** Scheduling time is when you know the least. Just before the event is when you know the most.
3. **Keep knowledge and rendering apart.** Write what happens to a memory store as it happens. Let the document be a cheap function of it.
4. **Store changes as sentences.** "Moved from X to Y" is easy to retain, easy to recall, and easy for a model to reason about. I did not need a change-event schema.
5. **Make user edits inputs, not overrides.** The moment you overwrite something a person wrote, they stop writing.

I still keep `generatedAt` on the type. It is the reason I noticed the problem, and now it is the reason a stale brief announces itself.
