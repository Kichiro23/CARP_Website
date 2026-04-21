import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useLocation } from '@/hooks/useLocation';
import Layout from '@/components/Layout';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import LiveMap from '@/pages/LiveMap';
import AirQuality from '@/pages/AirQuality';
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

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function App() {
  const auth = useAuth();
  const theme = useTheme();
  const location = useLocation();

  const app = (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login login={auth.login} googleLogin={auth.googleLogin} />} />
      <Route path="/register" element={<Register register={auth.register} googleLogin={auth.googleLogin} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<Layout user={auth.user} logout={auth.logout} current={location.current} loading={auth.loading} />}>
        <Route path="/dashboard" element={<Dashboard
          current={location.current}
          locations={location.locations}
          selectLocation={location.selectLocation}
          addLocation={location.addLocation}
        />} />
        <Route path="/map" element={<LiveMap current={location.current} />} />
        <Route path="/air-quality" element={<AirQuality current={location.current} />} />
        <Route path="/countries" element={<Countries />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/analytics" element={<Analytics current={location.current} />} />
        <Route path="/trends" element={<Trends current={location.current} />} />
        <Route path="/alerts" element={<Alerts current={location.current} />} />
        <Route path="/news" element={<News current={location.current} />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile
          user={auth.user}
          updateProfile={auth.updateProfile}
          locations={location.locations}
          addLocation={location.addLocation}
          removeLocation={location.removeLocation}
          setDefaultLocation={location.setDefaultLocation}
        />} />
        <Route path="/settings" element={<Settings theme={theme.theme} toggleTheme={theme.toggleTheme} />} />
        <Route path="/security" element={<Security changePassword={auth.changePassword} user={auth.user} />} />
      </Route>
    </Routes>
  );

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'dummy'}>
      {app}
    </GoogleOAuthProvider>
  );
}
