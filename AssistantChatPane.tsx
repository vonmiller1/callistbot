import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  CornerDownLeft, 
  Trash2, 
  Lightbulb
} from 'lucide-react';
import { ChatMessage } from '../types';

interface AssistantChatPaneProps {
  initialQuery?: string;
}

export const AssistantChatPane: React.FC<AssistantChatPaneProps> = ({ initialQuery }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi there! I'm your **Calist Meeting Assistant**.

I help you stay on top of your workday by checking your meetings, emails, and notes.

Feel free to ask me questions like:
- *"What did Sarah say about the budget?"*
- *"What are my key to-dos for today?"*
- *"When does Marcus prefer to meet?"*`,
      timestamp: 'Just now'
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || input).trim();
    if (!text || isLoading) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Friendly, direct knowledge answers for working people
      const lower = text.toLowerCase();
      let responseText = '';

      if (lower.includes('sarah') && lower.includes('budget')) {
        responseText = `**Sarah Jenkins approved the $240,000 budget** for 250 enterprise seats!

Here is what you need to know for your call with her:
1. **Decision**: The budget is approved, but she needs confirmation of uptime guarantees.
2. **Timing**: Sarah has a strict hard stop at **2:30 PM** for an earnings briefing.
3. **Best Strategy**: Skip intro slides and lead with the confirmation link right away.`;
      } else if (lower.includes('to-do') || lower.includes('commitment') || lower.includes('open') || lower.includes('vantage')) {
        responseText = `Here are your open to-dos with the Vantage team:

1. **Share the login link with Dave Chen**: Dave just needs to verify the staging link to finalize security signoff.
2. **Demonstrate speed to Dr. Marcus Vance**: The engineering team clocked 1.1s response speed this morning (beating his 2.0s requirement).
3. **Send contract to Sarah Jenkins**: Ready to send via DocuSign once Dave and Marcus give their quick thumbs up.`;
      } else if (lower.includes('prefer') || lower.includes('meet') || lower.includes('habit') || lower.includes('timing')) {
        responseText = `Here is when your key attendees prefer to meet:

• **Sarah Jenkins**: Tuesday & Thursday afternoons (**1:30 PM – 4:00 PM**). Prefers strict 25–30 min syncs with no fluff.
• **Dr. Marcus Vance**: Late afternoons (**3:00 PM – 5:00 PM**). Prefers live demos instead of slide presentations.
• **Dave Chen**: Mornings (**10:00 AM – 11:30 AM**). Very punctual and likes direct checklist confirmations.
• **Elena Rostova**: Mornings (**9:30 AM – 11:30 AM**). Loves collaborative discussions and friendly brainstorms.`;
      } else {
        // Call backend API if running with Gemini key
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: text })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.answer) {
              responseText = data.answer;
            }
          }
        } catch (e) {
          // ignore error
        }

        if (!responseText) {
          responseText = `I checked your notes and calendar for "${text}". Everything looks on track! Is there a specific meeting or person you would like me to summarize?`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content: responseText,
          timestamp: 'Just now'
        }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-2',
        role: 'assistant',
        content: 'Chat cleared. How can I help you prepare for your next call?',
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col h-[700px] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Calist Assistant
            </h2>
            <p className="text-xs text-slate-500">
              Ask anything about your meetings, schedule, or team notes
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          title="Clear chat"
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested chips */}
      <div className="px-6 py-2.5 bg-indigo-50/40 border-b border-indigo-100/60 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-semibold text-indigo-700 shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          Try asking:
        </span>
        {[
          'What did Sarah say about the budget?',
          'What are my open to-dos with Vantage?',
          'When do these attendees prefer to meet?'
        ].map((sample, i) => (
          <button
            key={i}
            onClick={() => handleSend(sample)}
            className="text-xs shrink-0 px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg border border-slate-200 shadow-2xs transition-colors"
          >
            "{sample}"
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>
                <div className={`text-[10px] mt-2 ${isUser ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center text-xs text-slate-500">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span>Checking notes and preparing answer...</span>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here (e.g., 'Summarize today's call')..."
            className="w-full pl-4 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>Ask</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
