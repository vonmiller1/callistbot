# What I Learned Feeding a Calendar Sync Into Hindsight

Calendar sync is one of those features where the demo is one line and the real work is everything around it. `POST /api/calendar/sync-now` returns "Calendars synchronized in background" and moves on. Pointing that same sync at a long-term memory store turned out to teach me more about my data than any schema review had.

This is a write-up of what happens when events flow from Google Calendar and Outlook into [Hindsight](https://github.com/vectorize-io/hindsight), and specifically about the three things I got wrong: what to retain, how often, and how to avoid remembering the same thing forty times.

## The setup

Calist is a meeting prep tool with a React frontend and a TypeScript Express server. Users connect a calendar through the integrations screen, and the server keeps their meetings up to date with background sync. Each meeting records where it came from:

```ts
sourceCalendar?: 'google' | 'microsoft' | 'internal';
```

and the integration account tracks its own state:

```ts
export interface IntegrationAccount {
  provider: IntegrationProvider;
  status: 'connected' | 'syncing' | 'disconnected';
  lastSyncedAt: string;
  // ...
}
```

The sync endpoint is deliberately small:

```ts
app.post('/api/calendar/sync-now', requireAuth, (req: AuthenticatedRequest, res) => {
  const result = db.syncCalendarNow(req.user!.id);
  return res.json({ success: true, message: 'Calendars synchronized in background.', ...result });
});
```

For a long time that was the whole story: events in, meetings out, UI updates. The assistant read the meetings table. The part I wanted to add was the assistant learning from them.

## First attempt: retain every event

The naive version is obvious. For each event in the sync payload, write it to memory:

```ts
for (const ev of events) {
  await hindsight.retain(bank, { content: JSON.stringify(ev) });
}
```

I did this for about a day, and it was useless in an educational way.

An event is mostly metadata: a title, two timestamps, a list of email addresses, a Meet link, a recurrence rule. It tells you nothing about what was discussed or decided. What I had built was an expensive copy of the calendar in a system designed for knowledge. Recall against it returned things like "Weekly sync with Dave Chen, Tuesdays at 10." True, and not much use.

The [Hindsight docs](https://hindsight.vectorize.io/) describe retain as taking natural-language content and extracting facts from it. That is the clue I ignored. If I hand over a JSON blob, I get JSON-shaped facts back. If I hand over something a person would say, I get facts a person would want.

## Second attempt: retain what an event implies

The events themselves carry a small number of signals worth keeping:

- **Who I meet with, and how often.** That is a relationship fact ("I meet Dave Chen most Tuesdays"), not an event fact.
- **When people say yes.** `responseStatus` on a participant is `'accepted' | 'tentative' | 'declined' | 'invited'`. A run of declined Monday invites from someone is a preference.
- **Changes.** A meeting moving or cancelling is the closest thing a calendar has to a narrative.
- **Agenda text.** When someone bothers to write a description, that is real content.

So the retain step became a translation from event to sentences:

```ts
function eventToMemory(ev: Meeting, prev?: Meeting): string | null {
  const lines: string[] = [];

  if (!prev) {
    lines.push(`Scheduled "${ev.title}" for ${ev.date} at ${ev.startTime} with ${names(ev)}.`);
    if (ev.description || ev.agenda) lines.push(`Agenda: ${ev.agenda ?? ev.description}`);
  } else if (prev.date !== ev.date || prev.startTime !== ev.startTime) {
    lines.push(`"${ev.title}" was moved from ${prev.date} ${prev.startTime} to ${ev.date} ${ev.startTime}.`);
  }

  for (const p of ev.participants) {
    const before = prev?.participants.find((x) => x.id === p.id)?.responseStatus;
    if (before !== p.responseStatus && p.responseStatus === 'declined') {
      lines.push(`${p.name} declined "${ev.title}" (${ev.date}, ${ev.startTime}).`);
    }
  }

  return lines.length ? lines.join('\n') : null;
}
```

The `null` return matters. Most sync passes change nothing, and writing nothing is the correct outcome.

## The idempotency problem

Sync runs repeatedly, and the same event comes back every time. If retain isn't idempotent from my side, one recurring standup becomes hundreds of near-identical memories, and recall starts returning the same fact five times, crowding out everything else.

I handle that in two places.

**A per-event fingerprint.** I store a hash of the fields I care about (title, date, start time, participant statuses) with each synced meeting. On the next pass, if the hash matches, `eventToMemory` is never called. The database holds the previous state and the diff is computed against it, which is why `prev` is a parameter above.

**A stable context tag.** Each write carries a context string derived from the meeting id, so everything about one meeting is grouped and I can find or remove it later:

```ts
await hindsight.retain(bank, {
  content: text,
  context: `calendar:${ev.sourceCalendar}:${ev.id}`,
});
```

Recurring meetings needed one more rule. A weekly standup is a pattern, not fifty events. I retain the first occurrence and any deviations (moved, cancelled, someone declined), and let the recurrence rule speak for the rest. Retaining every instance made "what do I usually do on Tuesdays" worse, not better, because the facts drowned in repetition.

## Sync can lie to you

A few things about calendar data that a schema won't tell you:

**Deleted and cancelled are different.** A cancelled meeting is information ("Vantage kickoff was cancelled"). A deleted event may be someone tidying up. The server has separate routes, `POST /api/meetings/:id/cancel` and `DELETE /api/meetings/:id`, and they now write different things. Cancel retains a fact. Delete retains nothing, and removes what was retained under that meeting's context tag.

**Time zones will bite you.** The `Meeting` type carries a `timezone` per event. Memory that says "moved to 3:00" with no zone is a landmine for someone who travels. Every time-bearing sentence includes the zone now.

**Two calendars, one meeting.** If a person is invited from both Google and Outlook, they show up twice. I match on title, start time, and attendee overlap before retaining, and I would rather miss a duplicate than merge two real meetings.

**First sync is a flood.** When a user connects a calendar, the initial import can contain years of history. Retaining all of it makes the first day of use slow and the memory noisy. I retain the last few months and everything upcoming, and let older history stay in the calendar.

## What it did for the assistant

I did not run a benchmark, and I would not trust one for this. The observable difference is behavioral. Before, the assistant knew what was on the calendar and nothing else. After, it can answer questions like "has Dave declined anything recently?" or "did the Vantage call move again?" from retained facts, and it stops offering "Monday morning" to someone who has declined three Monday mornings.

That last behavior was the one that made me believe in the approach. Nobody wrote a rule about it. It fell out of writing down what happened in plain sentences and asking a good question later.

## Takeaways

1. **Don't retain raw payloads.** A JSON blob in gives JSON facts out. Translate to the sentence a person would write.
2. **Diff before you write.** The most valuable branch in a sync-to-memory pipeline is the one that returns early.
3. **Give every write a stable context key.** You will want to find, update, or remove everything about one meeting later.
4. **Model patterns, not instances.** Recurring meetings should be retained as a rule plus exceptions.
5. **Treat cancel and delete as different facts.** One is knowledge, the other is housekeeping.

If you are building anything that syncs external data into an agent's memory, the [agent memory overview from Vectorize](https://vectorize.io/what-is-agent-memory) is worth a read before you design the write path. Mine changed twice, and both times the fix was writing less.
