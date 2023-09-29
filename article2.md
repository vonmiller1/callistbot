# I Deleted a Keyword Router and Let Hindsight Answer the Question

The first version of my assistant chat was an `if` statement. If your message contained "sarah" and "budget", you got a paragraph about Sarah's budget. If it contained "habit", you got a paragraph about habits. Anything else fell through to an LLM call that knew nothing. It worked in every demo I gave, which is exactly why it took me so long to admit it was a lookup table with a chat UI on top.

This is about ripping that out, what replaced it, and why I now think "which branch do I hit?" is the wrong question for an agent that answers questions about your work.

## The system in one paragraph

Calist prepares me for meetings. It syncs my Google and Outlook calendars, generates a brief for each meeting (summary, objective, talking points, questions, tips per attendee), and has a chat pane for ad hoc questions like "what did I promise the Vantage team?" The stack is a React frontend and a TypeScript Express server. Generation goes through Gemini, and long-term knowledge lives in [Hindsight, an open-source agent memory system](https://github.com/vectorize-io/hindsight). The chat pane is where the difference between "has a database" and "has memory" is the most obvious, because users ask free-form questions and notice immediately when the answer is canned.

## The router I'm not proud of

Here is the shape of the original handler in the chat pane component. I've trimmed the response bodies:

```ts
const lower = text.toLowerCase();
let responseText = '';

if (lower.includes('sarah') && lower.includes('budget')) {
  responseText = `**Sarah Jenkins approved the $240,000 budget** for 250 enterprise seats! ...`;
} else if (lower.includes('to-do') || lower.includes('commitment') || lower.includes('open') || lower.includes('vantage')) {
  responseText = `Here are your open to-dos with the Vantage team: ...`;
} else if (lower.includes('prefer') || lower.includes('meet') || lower.includes('habit') || lower.includes('timing')) {
  responseText = `Here is when your key attendees prefer to meet: ...`;
} else {
  // fall through to POST /api/chat
}
```

You can already see the problems.

The branches overlap. "When should I meet Sarah about the budget?" matches the first branch and answers about budget, not timing. The word `open` matches "open the door", "open issues" and "is the Vantage deal open?" alike. Every new kind of question meant a new branch, and every new branch stole traffic from an older one.

Worse, the answers were static. The text is written by me, at build time. The knowledge in it does not change when the world changes. If Dave Chen sends the staging link back and security signs off, the "open to-dos" answer is wrong until I edit the source.

And the fallthrough, the only branch that touched the model, looked like this on the server:

```ts
const prompt = `You are Calist ... Below is the user's scheduled meetings and context:
${JSON.stringify(meetings.map((m) => ({ title: m.title, date: m.date, time: m.startTime, participants: m.participants.map((p) => p.name) })), null, 2)}

User Question: "${query}"`;
```

Titles, dates, times and names. The one path that could have answered freely had almost nothing to answer with. So I had two paths, one with opinions and no flexibility, the other with flexibility and no facts.

## The reframe: retrieval is the router

What I wanted was for the question itself to decide what gets pulled in. "What did I promise the Vantage team?" and "When does Sarah like to meet?" are different queries against the same body of knowledge, and I shouldn't have to know in advance which one is coming.

That is what a semantic recall call gives you. The question goes to the memory store, and whatever facts are relevant to that question come back ranked. The [Hindsight docs](https://hindsight.vectorize.io/) describe this as the recall side of the API, next to retain (write) and reflect (synthesize). If you want the conceptual version, Vectorize has a readable page on [what agent memory is and how it differs from a bigger context window](https://vectorize.io/what-is-agent-memory).

So the new server handler is, more or less, this:

```ts
app.post('/api/chat', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { query } = req.body;
  const user = req.user!;

  const memories = await hindsight.recall(`user-${user.id}`, { query });

  const prompt = `You are Calist, a meeting preparation assistant for ${user.name}.
What you know that may be relevant:
${memories.map((m) => `- ${m.text}`).join('\n') || '(nothing relevant)'}

Question: "${query}"
Answer from the notes above. If they don't cover it, say you don't know.`;

  // ...Gemini call as before
});
```

And the frontend handler shrinks to a single `fetch`. No keyword checks, no canned strings. I deleted about forty lines and the `if` chain went with them.

## What changed in practice

The three canned answers still exist, but as behaviors instead of strings.

Ask "what's the deal with Sarah's budget?" and the answer comes from whatever I have retained about Sarah and that deal: the approved amount, the open question about uptime guarantees, the fact that she hard-stops at 2:30. If I told the system last week that she moved her stop to 3:00, the answer follows.

Ask "when should I schedule Elena?" and the same endpoint returns timing preferences, because the question pulled in timing facts. No branch chose that.

Ask something I would never have written a branch for, like "who on the Vantage side hasn't seen the pricing yet?", and the honest answer is either something grounded in what I have noted or "I don't have anything on that." The second answer is the important one.

## The parts that were harder than they sound

**Prompting for "I don't know" is not optional.** With the calendar-only prompt, the model would hedge because it had nothing. With a memory-backed prompt, it has enough to sound authoritative even when the retrieved facts are only loosely related. I added the explicit instruction to answer from the notes and admit gaps, and I treat regressions there as bugs. A wrong answer in confident prose is worse than the canned answer ever was.

**Short questions retrieve badly.** "What about Dave?" has almost no signal. I now let the server rewrite short follow-ups into a standalone query using the last couple of turns before calling recall. That rewrite step turned out to matter more than any prompt tuning.

**Recall results need a budget.** Early on I passed everything back into the prompt. That recreated the problem I was solving: too much text, the relevant fact buried in the middle. Capping the number of recalled items and sorting by relevance fixed most of it.

**The canned answers hid bugs.** Once the router was gone, I found cases where the retained data was thin. The canned "open to-dos" answer had papered over the fact that I was not retaining action items with their assignee and status. The `ActionItem` type has both (`assignee`, `status: 'pending' | 'completed'`), but nothing wrote them anywhere the assistant could see. Deleting the router made that visible within a day.

## What I'd tell someone about to write a router

1. **If your chat handler has keyword branches, you have a search problem, not a chat problem.** Every `includes()` is a poor man's retrieval query.
2. **Canned answers rot silently.** Static text can't notice the world changed. Retrieved facts at least have a chance.
3. **Make ignorance a supported outcome.** The first job of a memory-backed answer is not to invent things when the notes are silent.
4. **Rewrite the query before you retrieve.** Conversational follow-ups are the norm, and embedding "what about him?" gets you noise.
5. **Deleting the fallback path is a good test.** If the system falls apart without your hand-written cases, they were carrying more weight than you thought. Mine were, and that told me exactly which facts I had not been storing.

I keep a few of the old canned strings around as test fixtures now. They are the expected answers I check the memory-backed version against, which is the only useful thing a hard-coded answer can be.
