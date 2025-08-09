import React from 'react';
import { Button, Input } from 'antd';
import type { ComponentConfig, ComponentProps } from '../../types/editor';

// 基础组件渲染
const TextRenderer: React.FC<{ props: ComponentProps }> = ({ props }) => {
  const { content, fontSize, color, textAlign } = props;
  return (
    <div style={{ fontSize: fontSize as number, color: color as string, textAlign: textAlign as 'left' | 'center' | 'right' }}>
      {content as string}
    </div>
  );
};

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
        pointerEvents: 'none', // 防止图片干扰拖拽
      }} 
    />
  );
};

const DivRenderer: React.FC<{ props: ComponentProps }> = ({ props }) => {
  const { content, backgroundColor, padding, borderRadius } = props;
  return (
    <div style={{ 
      backgroundColor: backgroundColor as string, 
      padding: padding as string, 
      borderRadius: borderRadius as string,
      border: '1px dashed #ddd',
      minHeight: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {content as string}
    </div>
  );
};

const FlexContainerRenderer: React.FC<{ props: ComponentProps }> = ({ props }) => {
  const { direction, justifyContent, alignItems, gap, padding, backgroundColor, minHeight } = props;
  return (
    <div style={{ 
      display: 'flex',
      flexDirection: direction as 'row' | 'column',
      justifyContent: justifyContent as string,
      alignItems: alignItems as string,
      gap: gap as string,
      padding: padding as string,
      backgroundColor: backgroundColor as string,
      minHeight: minHeight as string,
      border: '2px dashed #ccc',
      borderRadius: '4px'
    }}>
      <div style={{ color: '#999', fontSize: '12px' }}>Flex容器 - 可拖入其他组件</div>
    </div>
  );
};

// 组件映射
const componentMap: Record<string, React.FC<{ props: ComponentProps }>> = {
  'Text': TextRenderer,
  'Image': ImageRenderer,
  'Div': DivRenderer,
  'FlexContainer': FlexContainerRenderer,
};

// 渲染组件
export const renderComponent = (config: ComponentConfig) => {
  const { type, props } = config;
  
  // 基础组件
  if (componentMap[type]) {
    const Component = componentMap[type];
    return <Component props={props} />;
  }
  
  // Ant Design组件
  if (type.startsWith('antd.')) {
    const componentName = type.split('.')[1];
    
    switch (componentName) {
      case 'Button':
        return <Button {...props} />;
      case 'Input':
        return <Input {...props} />;
      default:
        return <div>未知组件: {type}</div>;
    }
  }
  
  return <div>未知组件: {type}</div>;
};