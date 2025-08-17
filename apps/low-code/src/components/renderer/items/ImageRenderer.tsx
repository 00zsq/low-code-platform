import React from 'react';
import type { ComponentProps } from '../../../types/editor';

const ImageRenderer: React.FC<{ props: ComponentProps }> = ({ props }) => {
  const { src, alt, width } = props;
  return (
    <img
      src={src as string}
      alt={alt as string}
      style={{
        width: width as string,
        height: 'auto',
        maxWidth: '100%',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
};

export default ImageRenderer;
