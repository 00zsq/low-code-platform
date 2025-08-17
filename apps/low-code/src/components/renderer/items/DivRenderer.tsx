import React from 'react';
import type { ComponentProps } from '../../../types/editor';

const DivRenderer: React.FC<{ props: ComponentProps }> = ({ props }) => {
  const { content, backgroundColor, padding, borderRadius } = props;
  return (
    <div
      style={{
        backgroundColor: backgroundColor as string,
        padding: padding as string,
        borderRadius: borderRadius as string,
        border: '1px dashed #ddd',
        minHeight: '50px',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
      }}
    >
      {content as string}
    </div>
  );
};

export default DivRenderer;
