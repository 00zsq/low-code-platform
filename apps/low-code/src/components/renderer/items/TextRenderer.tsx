import React from 'react';
import type { ComponentProps } from '../../../types/editor';

const TextRenderer: React.FC<{ props: ComponentProps }> = ({ props }) => {
  const { content, fontSize, color, textAlign, type } = props;

  const style = {
    fontSize: fontSize as number,
    color: color as string,
    textAlign: textAlign as 'left' | 'center' | 'right',
  };

  const textContent = content as string;

  // 根据文本类型选择对应的 HTML 标签
  switch (type) {
    case 'h1':
      return <h1 style={style}>{textContent}</h1>;
    case 'h2':
      return <h2 style={style}>{textContent}</h2>;
    case 'h3':
      return <h3 style={style}>{textContent}</h3>;
    case 'p':
      return <p style={style}>{textContent}</p>;
    case 'strong':
      return <strong style={style}>{textContent}</strong>;
    case 'em':
      return <em style={style}>{textContent}</em>;
    default:
      return <span style={style}>{textContent}</span>;
  }
};

export default TextRenderer;
