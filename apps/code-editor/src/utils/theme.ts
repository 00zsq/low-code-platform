import { useState, useEffect } from 'react';
import type { Theme } from '../types';

const THEME_KEY = 'code-editor-theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY) as Theme;
      const initialTheme = saved || 'dark';
      // 立即设置DOM属性，确保一致性
      document.documentElement.setAttribute('data-theme', initialTheme);
      return initialTheme;
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_KEY, theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // 立即更新DOM，确保其他组件能感知到变化
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_KEY, newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  return { theme, toggleTheme };
}
