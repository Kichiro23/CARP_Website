import { useEffect, useRef, useState } from 'react';
import { Chrome } from 'lucide-react';

/**
 * Google Sign-In button using Google's Identity Services.
 *
 * HOW TO SET UP (step by step):
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project (or use existing)
 * 3. APIs & Services > Library > Search "Google Identity Toolkit API" > Enable
 * 4. APIs & Services > OAuth consent screen
 *    - User Type: External
 *    - App name: "CARP"
 *    - User support email: your email
 *    - Developer contact: your email
 *    - Scopes: email, profile, openid
 *    - Test users: add your Gmail
 * 5. APIs & Services > Credentials > Create Credentials > OAuth client ID
 *    - Application type: Web application
 *    - Name: "CARP Web"
 *    - Authorized JS origins: http://localhost:5173 (dev) + your deployed URL
 *    - Authorized redirect URIs: your deployed URL
 * 6. Copy the Client ID
 * 7. Paste it as the VITE_GOOGLE_CLIENT_ID env variable
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface Props {
  onSuccess: (data: {
    googleId: string;
    name: string;
    email: string;
    picture: string;
  }) => void;
  onError: (msg: string) => void;
}

export default function GoogleSignIn({ onSuccess, onError }: Props) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Load Google's script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setUseFallback(true);
      return;
    }

    // If script already loaded
    if (document.getElementById('google-identity-script')) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-identity-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setUseFallback(true);
    document.body.appendChild(script);

    return () => {
      // Don't remove on unmount - other components might need it
    };
  }, []);

  // Initialize Google button
  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current || !GOOGLE_CLIENT_ID) return;

    try {
      // @ts-ignore - google is loaded via script
      window.google?.accounts?.id?.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          // Decode JWT token from Google
          const payload = parseJwt(response.credential);
          if (!payload) {
            onError('Failed to parse Google response');
            return;
          }
          onSuccess({
            googleId: payload.sub,        // Google's unique user ID
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
          });
        },
        error_callback: () => {
          onError('Google sign-in was cancelled or failed');
        },
      });

      // @ts-ignore
      window.google?.accounts?.id?.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: buttonRef.current.clientWidth || 320,
      });
    } catch {
      setUseFallback(true);
    }
  }, [scriptLoaded, onSuccess, onError]);

  // Manual one-tap sign-in (fallback that works without Google's button renderer)
  const handleManualSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      // Demo mode - no Google credentials configured yet
      onError(
        'Google OAuth not configured. Follow the setup guide below to enable real Google Sign-In.'
      );
      return;
    }

    try {
      // @ts-ignore
      window.google?.accounts?.id?.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One-tap not available, try redirect
          onError('Google sign-in popup was blocked. Please allow popups for this site.');
        }
      });
    } catch {
      onError('Google sign-in failed to initialize');
    }
  };

  // If no Google Client ID is set, show a styled fallback button
  if (useFallback || !GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        onClick={handleManualSignIn}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all hover:bg-white/5"
        style={{ borderColor: 'var(--tile-border)', color: 'var(--text)' }}
      >
        <Chrome className="h-4 w-4 text-blue-400" />
        Sign in with Google
      </button>
    );
  }

  // Google's official rendered button
  return (
    <div className="mb-4 flex w-full justify-center">
      <div ref={buttonRef} className="w-full" />
    </div>
  );
}

// Decode Google's JWT credential
function parseJwt(token: string) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
