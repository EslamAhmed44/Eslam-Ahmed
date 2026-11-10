'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { sound } from '@/lib/audio/sound';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  soundMuted: boolean;
  toggleSound: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
  soundMuted: false,
  toggleSound: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Theme resolution
    try {
      const savedTheme = localStorage.getItem('app_theme') as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
      } else {
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        const initialTheme: Theme = prefersLight ? 'light' : 'dark';
        setThemeState(initialTheme);
        document.documentElement.setAttribute('data-theme', initialTheme);
        if (initialTheme === 'light') {
          document.documentElement.classList.add('light');
        }
      }
    } catch {}

    // Sound resolution
    setSoundMuted(sound.getMuted());
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem('app_theme', t);
      document.documentElement.setAttribute('data-theme', t);
      if (t === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    } catch {}
    sound.playClick();
  };

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setSoundMuted(muted);
    if (!muted) {
      sound.playClick();
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        soundMuted,
        toggleSound,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

