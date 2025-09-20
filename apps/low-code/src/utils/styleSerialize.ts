/**
 * 样式序列化工具模块
 * 用于将 React 样式对象转换为不同格式的字符串
 * 支持 JSX 和 HTML 两种目标格式
 */

/** 样式对象类型定义 */
export type StyleLike = Record<string, string | number | undefined>;

/**
 * 将未知类型的值转换为有效的样式值
 * @param v 输入值
 * @returns 转换后的样式值或 undefined
 */
export const toStyleValue = (v: unknown): string | number | undefined => {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'number' || typeof v === 'string') return v;
  return String(v);
};

/**
 * 将 React.CSSProperties 序列化为 JSX style 对象字面量字符串
 * 输出格式：key: value, key2: 'value2'（不含最外层花括号）
 *
 * @param style 样式对象
 * @returns JSX 格式的样式字符串
 */
export const serializeStyleForJsx = (style?: StyleLike): string => {
  if (!style) return '';

  // 过滤掉 undefined 和 null 值
  const entries = Object.entries(style).filter(
    ([, v]) => v !== undefined && v !== null
  );

  return entries
    .map(([k, v]) => {
      // 数字值直接输出，字符串值需要加引号并转义
      if (typeof v === 'number') return `${k}: ${v}`;
      return `${k}: '${String(v).replace(/'/g, "\\'")}'`;
    })
    .join(', ');
};

/**
 * 将驼峰命名转换为短横线命名（kebab-case）
 * 例如：backgroundColor -> background-color
 *
 * @param s 驼峰命名字符串
 * @returns 短横线命名字符串
 */
export const camelToKebab = (s: string) =>
  s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/**
 * 将 React.CSSProperties 序列化为内联 CSS 字符串
 * 输出格式：background-color: #fff; font-size: 14px
 *
 * @param style 样式对象
 * @returns HTML 内联样式字符串
 */
export const serializeStyleForHtml = (style?: StyleLike): string => {
  if (!style) return '';

  // 过滤掉 undefined 和 null 值
  const entries = Object.entries(style).filter(
    ([, v]) => v !== undefined && v !== null
  );

  return entries
    .map(([k, v]) => {
      // 转换属性名为 kebab-case，数字值自动添加 px 单位
      const property = camelToKebab(k);
      const value = typeof v === 'number' ? `${v}px` : String(v);
      return `${property}: ${value}`;
    })
    .join('; ');
};
