import { useState, useEffect } from 'react';

export type Theme = 'system' | 'light' | 'dark';

const KEY = 'padel-theme';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark');
  if (theme === 'light') root.classList.add('theme-light');
  if (theme === 'dark') root.classList.add('theme-dark');
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(KEY) as Theme) ?? 'system'
  );

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  function cycle() {
    setTheme((t) => (t === 'system' ? 'light' : t === 'light' ? 'dark' : 'system'));
  }

  return { theme, cycle };
}
