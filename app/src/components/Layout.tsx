import { Outlet } from 'react-router';
import Navbar from './Navbar';
import Footer from './Footer';
import AIAssistant from './AIAssistant';
import VideoBackground from './VideoBackground';
import type { Theme, User } from '@/types';

interface Props {
  theme: Theme;
  toggleTheme: () => void;
  auth: { user: User | null; logout: () => void };
}

export default function Layout({ theme, toggleTheme, auth }: Props) {
  return (
    <div className="relative flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Global video background */}
      <VideoBackground opacity={0.35} />

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Navbar theme={theme} toggleTheme={toggleTheme} auth={auth} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
      <AIAssistant />
    </div>
  );
}
