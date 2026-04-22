import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import VideoBackground from './VideoBackground';
import type { User } from '@/types';
import type { SavedLocation } from '@/hooks/useLocation';

export default function Layout({ user, logout, current, loading }: { user: User | null; logout: () => void; current: SavedLocation; loading: boolean }) {
  if (loading) return (
    <div className="flex h-[100dvh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden">
      <VideoBackground opacity={0.3} />
      <Navbar auth={{ user, logout }} />
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet context={{ current }} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
