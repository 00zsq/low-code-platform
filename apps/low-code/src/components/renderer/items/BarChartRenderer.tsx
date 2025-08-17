import React from 'react';
import type { ComponentProps } from '../../../types/editor';

const BarChartRenderer: React.FC<{ props: ComponentProps }> = ({ props }) => {
  const { width, height, barColor, dataJson } = props;
  let data: Array<{ label: string; value: number }> = [];
  try {
    data = JSON.parse((dataJson as string) || '[]');
  } catch {}
  const maxValue = Math.max(1, ...data.map((d) => Number(d.value) || 0));

  // 解析数值宽高（仅在像素值时用于自适应柱宽计算）
  const widthStr = (width as string) || '400px';
  const heightStr = (height as string) || '200px';
  const numericWidth = /px$/i.test(widthStr)
    ? parseInt(widthStr, 10)
    : undefined;
  const numericHeight = /px$/i.test(heightStr) ? parseInt(heightStr, 10) : 200;

  const gap = 8;
  const innerPadding = 8; // 左右各 8px
  const count = Math.max(1, data.length);
  const availableWidth = numericWidth
    ? Math.max(0, numericWidth - innerPadding * 2 - gap * (count - 1))
    : undefined;
  const barWidth = availableWidth
    ? Math.max(16, Math.floor(availableWidth / count))
    : 24;

  const containerStyle: React.CSSProperties = {
    width: widthStr,
    height: heightStr,
    display: 'flex',
    alignItems: 'flex-end',
    gap,
    padding: `${innerPadding}px`,
    border: '1px solid #eee',
    borderRadius: 6,
    background: '#fff',
    overflow: 'hidden',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  };
  return (
    <div>
      <div style={containerStyle}>
        {data.map((d, i) => {
          const h =
            (Number(d.value) / maxValue) *
            Math.max(0, numericHeight - innerPadding * 2 - 24);
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: barWidth,
                  height: Math.max(2, h),
                  background: (barColor as string) || '#1677ff',
                  borderRadius: 4,
                }}
              />
              <div style={labelStyle}>{d.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChartRenderer;
