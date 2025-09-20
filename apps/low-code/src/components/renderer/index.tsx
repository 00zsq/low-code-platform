import React from 'react';
import { Button, Input } from 'antd';
import type { ComponentConfig, ComponentProps } from '../../types/editor';

// 导入所有自定义组件渲染器
import TextRenderer from './items/TextRenderer';
import ImageRenderer from './items/ImageRenderer';
import DivRenderer from './items/DivRenderer';
import FlexContainerRenderer from './items/FlexContainerRenderer';
import CustomTableRenderer from './items/CustomTableRenderer';
import BarChartRenderer from './items/BarChartRenderer';
import CustomButtonRenderer from './items/CustomButtonRenderer';
import CustomInputRenderer from './items/CustomInputRenderer';

/**
 * 自定义组件类型与渲染器的映射表
 * 用于将组件配置转换为实际的 React 组件
 */
const componentMap: Record<string, React.FC<{ props: ComponentProps }>> = {
  Text: TextRenderer,
  Image: ImageRenderer,
  Div: DivRenderer,
  FlexContainer: FlexContainerRenderer,
  CustomTable: CustomTableRenderer,
  BarChart: BarChartRenderer,
  CustomButton: CustomButtonRenderer,
  CustomInput: CustomInputRenderer,
};

/**
 * 组件渲染函数
 * 根据组件配置动态渲染对应的 React 组件
 * 支持自定义组件和 Ant Design 组件两种类型
 *
 * @param config 组件配置对象
 * @returns 渲染后的 React 元素
 */
export const renderComponent = (config: ComponentConfig) => {
  const { type, props } = config;

  // 渲染自定义组件
  if (componentMap[type]) {
    const Component = componentMap[type];
    return <Component props={props} />;
  }

  // 渲染 Ant Design 组件
  if (type.startsWith('antd.')) {
    const componentName = type.split('.')[1];

    switch (componentName) {
      case 'Button':
        return <Button {...props} />;
      case 'Input':
        return <Input {...props} />;
      default:
        return <div>未知 Ant Design 组件: {type}</div>;
    }
  }

  // 未知组件类型的降级处理
  return <div>未知组件: {type}</div>;
};
