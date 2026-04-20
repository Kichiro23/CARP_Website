import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message { text: string; sender: 'user' | 'bot'; }

function getBotResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes('hello') || q.includes('hi')) return 'Hello! I am CARP AI. Ask me about weather, air quality, or environmental data.';
  if (q.includes('weather')) return 'I can provide weather data for 25+ cities worldwide. Check the Dashboard for live conditions!';
  if (q.includes('aqi') || q.includes('air quality')) return 'AQI is measured via PM2.5 levels: Good (0-12), Moderate (12-35), Unhealthy (35-55), Hazardous (55+).';
  if (q.includes('temperature') || q.includes('temp')) return 'Temperature data comes from Open-Meteo API in real-time. Check the Dashboard for current readings.';
  if (q.includes('map')) return 'The Live Map shows AQI markers across 25+ global cities. Click any marker for detailed weather data.';
  if (q.includes('alert')) return 'The Alerts page monitors for extreme heat (>35C), strong winds (>50km/h), heavy rain, and hazardous AQI levels.';
  if (q.includes('clothing') || q.includes('wear')) return 'Check the Weather Intelligence section on the Dashboard for clothing recommendations based on current conditions.';
  if (q.includes('health')) return 'High UV and poor air quality can affect health. Check our Health alerts and AQI warnings in the Dashboard.';
  if (q.includes('news')) return 'The News section pulls the latest climate articles via RSS2JSON from The Guardian and BBC.';
  if (q.includes('compare')) return 'Use the Compare page to see side-by-side weather data for any two cities worldwide.';
  return 'I can help with weather data, AQI info, navigation tips, and more. What would you like to know?';
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hello! I\'m CARP AI. Ask me about weather, air quality, or the platform.', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { text: getBotResponse(userMsg), sender: 'bot' }]);
    }, 400);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-2xl transition-all hover:scale-105 pulse-glow"
        style={{ background: 'linear-gradient(135deg, #EA9D63, #d48952)' }}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex w-[360px] max-w-[calc(100vw-40px)] flex-col overflow-hidden glass-strong shadow-2xl" style={{ height: 480, borderRadius: '20px' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(234,157,99,0.15)' }}>
              <Bot className="h-5 w-5" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>CARP AI</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Smart Weather Assistant</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${m.sender === 'bot' ? '' : 'bg-[#A2B7C7]/20'}`} style={m.sender === 'bot' ? { background: 'rgba(234,157,99,0.15)' } : {}}>
                  {m.sender === 'bot' ? <Bot className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} /> : <User className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${m.sender === 'user' ? 'rounded-br-md' : 'rounded-bl-md'}`}
                  style={{ background: m.sender === 'bot' ? 'rgba(234,157,99,0.08)' : 'rgba(162,183,199,0.12)', color: 'var(--text)' }}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t p-3" style={{ borderColor: 'var(--glass-border)' }}>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about weather, AQI..."
              className="glass-input !py-2.5 !text-xs flex-1"
            />
            <button onClick={send} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all hover:scale-105" style={{ background: 'var(--primary)' }}>
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
