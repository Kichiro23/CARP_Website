import { Routes, Route, Navigate } from 'react-router-dom';
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
import News from '@/pages/News';
import About from '@/pages/About';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Security from '@/pages/Security';
import ChatAgent from '@/components/ChatAgent';
import Explore from '@/pages/Explore';
import AnalyticsHub from '@/pages/AnalyticsHub';
import WeatherTools from '@/pages/WeatherTools';
import JournalHub from '@/pages/JournalHub';
import Environment from '@/pages/Environment';
import Widget from '@/pages/Widget';

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
      <Route path="/widget" element={<Widget />} />

      {/* Redirect old standalone routes to new hub pages */}
      <Route path="/countries" element={<Navigate to="/explore" replace />} />
      <Route path="/compare" element={<Navigate to="/explore" replace />} />
      <Route path="/battle" element={<Navigate to="/explore" replace />} />
      <Route path="/trends" element={<Navigate to="/analytics" replace />} />
      <Route path="/alerts" element={<Navigate to="/analytics" replace />} />
      <Route path="/timemachine" element={<Navigate to="/tools" replace />} />
      <Route path="/heatmap" element={<Navigate to="/tools" replace />} />
      <Route path="/holidays" element={<Navigate to="/tools" replace />} />
      <Route path="/typhoons" element={<Navigate to="/tools" replace />} />
      <Route path="/zen" element={<Navigate to="/journal" replace />} />

      <Route element={<Layout user={auth.user} logout={auth.logout} current={location.current} loading={auth.loading} theme={theme.theme} toggleTheme={theme.toggleTheme} />}>
        <Route path="/dashboard" element={<Dashboard
          current={location.current}
          locations={location.locations}
          selectLocation={location.selectLocation}
          addLocation={location.addLocation}
        />} />
        <Route path="/map" element={<LiveMap current={location.current} />} />
        <Route path="/air-quality" element={<AirQuality current={location.current} />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/analytics" element={<AnalyticsHub current={location.current} />} />
        <Route path="/tools" element={<WeatherTools />} />
        <Route path="/journal" element={<JournalHub />} />
        <Route path="/environment" element={<Environment current={location.current} />} />
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
      <ChatAgent />
    </GoogleOAuthProvider>
  );
}
