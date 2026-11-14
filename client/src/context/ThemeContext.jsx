import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const THEME_PRESETS = [
  {
    id: 'nebula',
    name: 'Nebula Violet',
    color: '#6366f1',
    gradient: 'from-indigo-600 via-purple-600 to-pink-500',
    description: 'Electric Violet & Cyber AI'
  },
  {
    id: 'cyber',
    name: 'Cyber Cyan',
    color: '#06b6d4',
    gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    description: 'Neon Aqua & Tech Blue'
  },
  {
    id: 'aurora',
    name: 'Emerald Aurora',
    color: '#10b981',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-500',
    description: 'Vibrant Mint & Forest Green'
  },
  {
    id: 'sunset',
    name: 'Sunset Horizon',
    color: '#f43f5e',
    gradient: 'from-rose-500 via-amber-500 to-orange-500',
    description: 'Warm Coral & Amber Glow'
  }
];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('helpdesk_theme') || 'dark'; // Defaulting to sleek dark for modern aesthetic
  });

  const [preset, setPreset] = useState(() => {
    return localStorage.getItem('helpdesk_preset') || 'nebula';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('helpdesk_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-preset', preset);
    localStorage.setItem('helpdesk_preset', preset);
  }, [preset]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const changePreset = (newPreset) => {
    setPreset(newPreset);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, preset, changePreset, presets: THEME_PRESETS }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
