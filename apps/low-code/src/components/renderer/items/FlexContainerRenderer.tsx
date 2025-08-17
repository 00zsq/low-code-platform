import React from 'react';
import type { ComponentProps } from '../../../types/editor';

const FlexContainerRenderer: React.FC<{ props: ComponentProps }> = ({
  props,
}) => {
  const {
    direction,
    justifyContent,
    alignItems,
    gap,
    padding,
    backgroundColor,
    minHeight,
  } = props;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction as 'row' | 'column',
        justifyContent: justifyContent as string,
        alignItems: alignItems as string,
        gap: gap as string,
        padding: padding as string,
        backgroundColor: backgroundColor as string,
        minHeight: minHeight as string,
        border: '2px dashed #ccc',
        borderRadius: '4px',
      }}
    >
      <div style={{ color: '#999', fontSize: '12px' }}>
        Flex容器 - 可拖入其他组件
      </div>
    </div>
  );
};

export default FlexContainerRenderer;
