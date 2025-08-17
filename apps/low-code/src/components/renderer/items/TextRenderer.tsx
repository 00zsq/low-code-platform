import React from 'react';
import type { ComponentProps } from '../../../types/editor';

const TextRenderer: React.FC<{ props: ComponentProps }> = ({ props }) => {
  const { content, fontSize, color, textAlign } = props;
  return (
    <div
      style={{
        fontSize: fontSize as number,
        color: color as string,
        textAlign: textAlign as 'left' | 'center' | 'right',
      }}
    >
      {content as string}
    </div>
  );
};

export default TextRenderer;
