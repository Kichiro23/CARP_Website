import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const SYSTEM_PROMPT = `You are CARP AI, a helpful assistant for the CARP (Climate & Air Research Platform) website. You were created by BSCPE 3C students: Rommel Andrei L. De Leon, Raiza Charine H. Galang, Cristina Angela G. Sedigo, John Mareign B. Punzalan, and Rowella L. Lazaro.

CARP features:
- Real-time weather data from Open-Meteo API (temperature, humidity, wind, UV, precipitation)
- Air Quality Index (AQI) monitoring with PM2.5 data
- 7-day weather forecasts
- Interactive world map with 60+ cities including 20+ Philippine cities
- City search to add any city globally
- Climate news from RSS feeds
- Country information with flags
- User accounts with email/password and Google Sign-In

Weather knowledge:
- PM2.5 under 12 = Good, 12-35 = Moderate, 35-55 = Unhealthy for Sensitive, 55-150 = Unhealthy, 150+ = Hazardous
- AQI stands for Air Quality Index
- Weather data comes from Open-Meteo's global weather models
- For smaller cities, data is interpolated from nearby weather stations

Be friendly, concise, and helpful. Answer questions about the website features, weather, air quality, and how to use CARP.`;

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export default function ChatAgent() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I\'m CARP AI. Ask me anything about weather, air quality, or how to use this website!' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    if (!GEMINI_API_KEY) {
      setError('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');
      return;
    }

    const userText = input.trim();
    setInput('');
    setError('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [
              ...messages.filter(m => m.role !== 'model' || m.text !== 'Hi! I\'m CARP AI. Ask me anything about weather, air quality, or how to use this website!').map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
              })),
              { role: 'user', parts: [{ text: userText }] }
            ]
          })
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (err: any) {
      setError(err.message || 'Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[9999] flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-transform hover:scale-110"
          style={{ background: 'linear-gradient(135deg, #EA9D63, #d48952)', color: 'white' }}
          title="Ask CARP AI"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-5 right-5 z-[9999] flex flex-col overflow-hidden rounded-2xl border shadow-2xl"
          style={{
            width: 360,
            maxWidth: 'calc(100vw - 40px)',
            height: 520,
            maxHeight: 'calc(100vh - 40px)',
            background: 'var(--bg-secondary)',
            borderColor: 'var(--tile-border)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ background: 'linear-gradient(135deg, #EA9D63, #d48952)' }}>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-white" />
              <span className="text-sm font-bold text-white">CARP AI</span>
            </div>
            <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-white/20">
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: msg.role === 'user' ? 'var(--primary)' : 'var(--accent)' }}>
                  {msg.role === 'user' ? <User className="h-3.5 w-3.5 text-white" /> : <Bot className="h-3.5 w-3.5 text-white" />}
                </div>
                <div
                  className="max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed"
                  style={{
                    background: msg.role === 'user' ? 'var(--primary)' : 'var(--tile-bg)',
                    color: msg.role === 'user' ? 'white' : 'var(--text)',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--tile-border)',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--accent)' }}>
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'var(--tile-bg)', border: '1px solid var(--tile-border)', color: 'var(--text-muted)' }}>
                  Thinking...
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-lg px-3 py-2 text-center text-[11px] text-red-400" style={{ background: 'rgba(239,68,68,0.08)' }}>
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t px-3 py-2.5" style={{ borderColor: 'var(--tile-border)' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about weather, AQI, or CARP..."
              className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
              style={{ background: 'var(--tile-bg)', color: 'var(--text)', border: '1px solid var(--tile-border)' }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
