export type StyleLike = Record<string, string | number | undefined>;

export const toStyleValue = (v: unknown): string | number | undefined => {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'number' || typeof v === 'string') return v;
  return String(v);
};

// 将 React.CSSProperties 序列化为 JSX style 对象字面量字符串（不含最外层花括号）
export const serializeStyleForJsx = (style?: StyleLike): string => {
  if (!style) return '';
  const entries = Object.entries(style).filter(
    ([, v]) => v !== undefined && v !== null
  );
  return entries
    .map(([k, v]) => {
      if (typeof v === 'number') return `${k}: ${v}`;
      return `${k}: '${String(v).replace(/'/g, "\\'")}'`;
    })
    .join(', ');
};

// 将 React.CSSProperties 序列化为内联 CSS（kebab-case）
export const camelToKebab = (s: string) =>
  s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

export const serializeStyleForHtml = (style?: StyleLike): string => {
  if (!style) return '';
  const entries = Object.entries(style).filter(
    ([, v]) => v !== undefined && v !== null
  );
  return entries
    .map(
      ([k, v]) =>
        `${camelToKebab(k)}: ${typeof v === 'number' ? `${v}px` : String(v)}`
    )
    .join('; ');
};
