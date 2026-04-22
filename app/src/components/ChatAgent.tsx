import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isFallback?: boolean;
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

/* ─────────── Rule-based fallback ─────────── */

const RULES: { keywords: string[]; response: string }[] = [
  {
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'yo', 'sup'],
    response: `Hey there! I'm CARP AI. I can help you with weather info, air quality, or navigating the CARP website. What would you like to know?`,
  },
  {
    keywords: ['what is carp', 'about carp', 'carp means', 'what does carp stand for', 'who are you'],
    response: `CARP stands for **Climate & Air Research Platform**. It's a web app built by BSCPE 3C students (Rommel, Raiza, Cristina, John Mareign, and Rowella) that provides real-time weather data, air quality monitoring, and climate news from around the world.`,
  },
  {
    keywords: ['weather', 'temperature', 'forecast', 'humidity', 'wind', 'rain', 'sunny', 'cloudy', 'precipitation', 'uv'],
    response: `CARP shows real-time weather data from Open-Meteo API including temperature, humidity, wind speed, UV index, and precipitation. Go to the **Dashboard** or **Live Map** to see weather for your location or search any city worldwide!`,
  },
  {
    keywords: ['aqi', 'air quality', 'pm2.5', 'pm25', 'pollution', 'hazardous', 'unhealthy', 'moderate', 'good air'],
    response: `AQI (Air Quality Index) shows how clean or polluted the air is. Here's the scale:
• 0–12: Good
• 12–35: Moderate
• 35–55: Unhealthy for Sensitive Groups
• 55–150: Unhealthy
• 150+: Hazardous

Check the **Air Quality** page or **Live Map** for PM2.5 readings!`,
  },
  {
    keywords: ['map', 'live map', 'cities', 'location', ' philippines', 'manila', 'cebu', 'davao', 'quezon city', 'baguio'],
    response: `The **Live Map** has 60+ cities including 20+ Philippine cities (Manila, Quezon City, Cebu, Davao, Baguio, Bulacan, Pampanga, and more). You can search any city globally and it will show weather + air quality markers. Your searched cities are saved automatically!`,
  },
  {
    keywords: ['team', 'developers', 'who made', 'creators', 'authors', 'students', 'bscpe', 'de leon', 'galang', 'sedigo', 'punzalan', 'lazaro'],
    response: `CARP was built by BSCPE 3C students:
• Rommel Andrei L. De Leon
• Raiza Charine H. Galang
• Cristina Angela G. Sedigo
• John Mareign B. Punzalan
• Rowella L. Lazaro`,
  },
  {
    keywords: ['login', 'register', 'sign in', 'sign up', 'account', 'google', 'oauth', 'password', 'forgot password'],
    response: `You can create an account with email + password or use **Google Sign-In**. Once logged in, you can save favorite locations, set a default city, and manage your profile. Go to **Profile** to add or remove saved locations.`,
  },
  {
    keywords: ['news', 'climate news', 'rss', 'article'],
    response: `The **News** page pulls the latest climate and weather-related articles from RSS feeds. It covers global climate updates, environmental news, and weather events.`,
  },
  {
    keywords: ['countries', 'country', 'flag', 'nation', 'capital'],
    response: `The **Countries** page lets you explore information about countries around the world, including flags, capitals, populations, and regional data.`,
  },
  {
    keywords: ['compare', 'analytics', 'trends', 'alerts'],
    response: `CARP has several tools:
• **Compare** – compare weather between two locations
• **Analytics** – charts and stats for your location
• **Trends** – historical weather pattern analysis
• **Alerts** – set custom weather notifications`,
  },
  {
    keywords: ['settings', 'theme', 'dark mode', 'light mode', 'units', 'celsius', 'fahrenheit'],
    response: `Go to **Settings** to switch between Dark/Light mode, change temperature units (°C / °F), and clear your local cache. Your theme preference is saved automatically!`,
  },
  {
    keywords: ['help', 'how to use', 'features', 'what can you do', 'commands'],
    response: `Here's what you can do on CARP:
1. **Dashboard** – see weather & AQI for your location
2. **Live Map** – explore 60+ cities with real-time data
3. **Air Quality** – detailed PM2.5 readings
4. **Compare** – side-by-side location comparison
5. **News** – latest climate articles
6. **Countries** – explore country info
7. **Profile/Settings** – manage your account & preferences`,
  },
  {
    keywords: ['thank', 'thanks', 'ty', 'appreciate'],
    response: `You're welcome! Let me know if you need anything else.`,
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'cya', 'later'],
    response: `Goodbye! Stay safe and check the weather before heading out!`,
  },
];

const FALLBACK_GENERIC = `I'm not sure I understood that. I can help with questions about:
• Weather and forecasts
• Air quality / AQI / PM2.5
• Using the CARP website
• The team behind CARP

Or try asking something simpler!`;

function getRuleBasedResponse(userText: string): string {
  const lower = userText.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return rule.response;
    }
  }
  return FALLBACK_GENERIC;
}

function isQuotaError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return lower.includes('quota') || lower.includes('rate limit') || lower.includes('exceeded') || lower.includes('429');
}

/* ─────────── Component ─────────── */

export default function ChatAgent() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I\'m CARP AI. Ask me anything about weather, air quality, or how to use this website!' }
  ]);
  const [loading, setLoading] = useState(false);
  const [warn, setWarn] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const addModelMsg = useCallback((text: string, isFallback?: boolean) => {
    setMessages(prev => [...prev, { role: 'model', text, isFallback }]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setWarn('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    // If no API key, skip straight to rule-based
    if (!GEMINI_API_KEY) {
      const reply = getRuleBasedResponse(userText);
      addModelMsg(reply, true);
      setLoading(false);
      return;
    }

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
        const err = await res.json().catch(() => ({}));
        const msg = err.error?.message || `API error ${res.status}`;

        // Quota / rate limit → seamless fallback
        if (isQuotaError(msg)) {
          const fallback = getRuleBasedResponse(userText);
          addModelMsg(fallback, true);
          setWarn('CARP AI is running offline mode right now (API limit). Answers may be simpler.');
          setLoading(false);
          return;
        }
        throw new Error(msg);
      }

      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
      addModelMsg(reply);
    } catch (err: any) {
      // Network or other API errors → fallback too
      const fallback = getRuleBasedResponse(userText);
      addModelMsg(fallback, true);
      setWarn('CARP AI is running offline mode (connection issue). Answers may be simpler.');
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

          {/* Offline warning */}
          {warn && (
            <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ background: 'rgba(234,157,99,0.12)' }}>
              <AlertCircle className="h-3 w-3 shrink-0" style={{ color: 'var(--primary)' }} />
              <span className="text-[10px]" style={{ color: 'var(--primary)' }}>{warn}</span>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: msg.role === 'user' ? 'var(--primary)' : 'var(--accent)' }}>
                  {msg.role === 'user' ? <User className="h-3.5 w-3.5 text-white" /> : <Bot className="h-3.5 w-3.5 text-white" />}
                </div>
                <div
                  className="max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line"
                  style={{
                    background: msg.role === 'user' ? 'var(--primary)' : 'var(--tile-bg)',
                    color: msg.role === 'user' ? 'white' : 'var(--text)',
                    border: msg.role === 'user' ? 'none' : msg.isFallback ? '1px dashed var(--primary)' : '1px solid var(--tile-border)',
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
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t px-3 py-2.5" style={{ borderColor: 'var(--tile-border)' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Ask about weather, AQI, or CARP...'
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
