import { Globe, Leaf, Database, Shield, Code, BarChart3 } from 'lucide-react';

export default function About() {
  const team = [
    { name: 'Rommel De Leon', role: 'Project Lead', contribution: 'System architecture, dashboard design, API integration, and overall project coordination.' },
    { name: 'Raiza Galang', role: 'Frontend Developer', contribution: 'UI/UX implementation, glassmorphism design system, and responsive layouts.' },
    { name: 'Angela Sedigo', role: 'Data Analyst', contribution: 'Weather data analysis, chart configurations, and environmental research integration.' },
    { name: 'John Punzalan', role: 'Backend Developer', contribution: 'Authentication system, API endpoints, and data processing pipelines.' },
    { name: 'Rowella Lazaro', role: 'QA Engineer', contribution: 'Testing, bug tracking, performance optimization, and quality assurance.' },
  ];

  const tech = [
    { icon: Globe, label: 'React.js', desc: 'UI Framework' },
    { icon: Database, label: 'Open-Meteo', desc: 'Weather API' },
    { icon: Shield, label: 'OpenAQ', desc: 'Air Quality Data' },
    { icon: BarChart3, label: 'Chart.js', desc: 'Data Visualization' },
    { icon: Code, label: 'Leaflet', desc: 'Interactive Maps' },
    { icon: Leaf, label: 'RSS2JSON', desc: 'News Feed' },
  ];

  return (
    <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
      {/* Mission */}
      <div className="tile text-center py-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'rgba(234,157,99,0.1)' }}>
          <Globe className="h-7 w-7" style={{ color: 'var(--primary)' }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>About CARP</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          CARP (Climate & Air Research Platform) is a research-grade environmental monitoring system
          designed for public awareness and climate research. We aggregate real-time weather data,
          air quality indices, and environmental news from across the globe.
        </p>
      </div>

      {/* Team - CIRCULAR AVATARS */}
      <div>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Our Team</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <div key={member.name} className="tile text-center">
              {/* Circular Avatar */}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white" style={{ background: 'linear-gradient(135deg, #EA9D63, #d48952)' }}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{member.name}</h3>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>{member.role}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{member.contribution}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Technology Stack</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tech.map(t => (
            <div key={t.label} className="flex items-center gap-3 tile !p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0" style={{ background: 'rgba(234,157,99,0.08)' }}>
                <t.icon className="h-4 w-4" style={{ color: 'var(--primary)' }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{t.label}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center py-4">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>CARP v1.0 &bull; 2026 &bull; Built for educational research purposes</p>
      </div>
    </div>
  );
}
