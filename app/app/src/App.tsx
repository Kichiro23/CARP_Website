import { Routes, Route, Navigate } from 'react-router';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import Layout from '@/components/Layout';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import LiveMap from '@/pages/LiveMap';
import Countries from '@/pages/Countries';
import Compare from '@/pages/Compare';
import Analytics from '@/pages/Analytics';
import Trends from '@/pages/Trends';
import Alerts from '@/pages/Alerts';
import News from '@/pages/News';
import About from '@/pages/About';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Security from '@/pages/Security';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const auth = useAuth();

  useEffect(() => {
    auth.checkAuth();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={auth.isAuthenticated ? <Layout theme={theme} toggleTheme={toggleTheme} auth={auth} /> : <Navigate to="/login" replace />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/map" element={<LiveMap />} />
        <Route path="/countries" element={<Countries />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/news" element={<News />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/security" element={<Security />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
