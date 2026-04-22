import { useState, useEffect } from 'react';
import type { Theme } from '@/types';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('carp-theme') as Theme) || 'dark';
  });
  useEffect(() => {
    localStorage.setItem('carp-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return { theme, toggleTheme, isDark: theme === 'dark' };
}
