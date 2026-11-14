import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme, preset, changePreset, presets } = useTheme();
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const menuRef = useRef(null);

  // Close palette menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowPaletteMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-1.5" ref={menuRef}>
      {/* Theme Preset Palette Dropdown Button */}
      <div className="relative">
        <button
          onClick={() => setShowPaletteMenu(!showPaletteMenu)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1"
          title="Customize Theme Accent"
          aria-label="Customize Theme Accent"
        >
          <Palette className="w-4 h-4 text-brand-500" />
        </button>

        {showPaletteMenu && (
          <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 space-y-1 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              Color Palette Theme
            </div>
            {presets.map((p) => {
              const isActive = preset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    changePreset(p.id);
                    setShowPaletteMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.name}</span>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Light / Dark Mode Toggle Button */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <Moon className="w-4 h-4 text-slate-600 hover:text-slate-900" />
        ) : (
          <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300" />
        )}
      </button>
    </div>
  );
};
