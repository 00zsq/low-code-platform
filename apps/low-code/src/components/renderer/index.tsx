import React from 'react';
import { Button, Input } from 'antd';
import type { ComponentConfig, ComponentProps } from '../../types/editor';

import TextRenderer from './items/TextRenderer';
import ImageRenderer from './items/ImageRenderer';
import DivRenderer from './items/DivRenderer';
import FlexContainerRenderer from './items/FlexContainerRenderer';
import CustomTableRenderer from './items/CustomTableRenderer';
import BarChartRenderer from './items/BarChartRenderer';

// 组件映射
const componentMap: Record<string, React.FC<{ props: ComponentProps }>> = {
  Text: TextRenderer,
  Image: ImageRenderer,
  Div: DivRenderer,
  FlexContainer: FlexContainerRenderer,
  CustomTable: CustomTableRenderer,
  BarChart: BarChartRenderer,
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
