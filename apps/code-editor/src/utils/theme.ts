/**
 * 主题管理工具
 *
 * 提供主题切换功能，支持：
 * - 明暗主题切换
 * - 本地存储主题偏好
 * - DOM属性同步更新
 * - 防止主题闪烁
 */
import { useState, useEffect } from 'react';
import type { Theme } from '../types';

// 本地存储中主题设置的键名
const THEME_KEY = 'code-editor-theme';

/**
 * 主题管理Hook
 * @returns {object} 包含当前主题和切换函数的对象
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // 服务端渲染兼容性检查
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY) as Theme;
      const initialTheme = saved || 'dark'; // 默认使用暗色主题
      // 立即设置DOM属性，防止主题闪烁
      document.documentElement.setAttribute('data-theme', initialTheme);
      return initialTheme;
    }
    return 'dark';
  });

  // 主题变更时同步更新本地存储和DOM属性
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_KEY, theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  /**
   * 切换主题函数
   * 在明暗主题之间切换
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // 立即更新DOM和本地存储，确保其他组件能立即感知到变化
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_KEY, newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  return {
    theme, // 当前主题
    toggleTheme, // 主题切换函数
  };
}
