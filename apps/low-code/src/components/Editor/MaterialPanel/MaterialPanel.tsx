import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { materialsByCategory } from '../../../materials';
import type { ComponentDefinition } from '../../../types/editor';
import './MaterialPanel.css';
import {
  FontSizeOutlined,
  PictureOutlined,
  BorderOutlined,
  EditOutlined,
  AppstoreAddOutlined,
  TableOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  PartitionOutlined,
  NumberOutlined,
  BoldOutlined,
} from '@ant-design/icons';

/**
 * 组件类型与图标的映射关系
 * 为不同类型的组件提供直观的图标表示
 */
const iconMap: Record<string, React.ReactNode> = {
  // 基础组件图标
  Text: <FontSizeOutlined />,
  Image: <PictureOutlined />,
  Div: <BorderOutlined />,
  FlexContainer: <PartitionOutlined />,

  // 自定义交互组件图标
  CustomButton: <PlayCircleOutlined />,
  CustomInput: <EditOutlined />,

  // 高级组件图标
  CustomTable: <TableOutlined />,
  BarChart: <BarChartOutlined />,

  // Ant Design 组件图标
  'antd.Button': <BoldOutlined />,
  'antd.Input': <NumberOutlined />,
};

/**
 * 组件图标容器
 * 根据组件分类显示不同颜色的图标
 */
const IconBox: React.FC<{ material: ComponentDefinition }> = ({ material }) => {
  /**
   * 根据组件分类返回对应的主题色
   * @returns 十六进制颜色值
   */
  const getIconColor = () => {
    switch (material.category) {
      case 'basic':
        return '#52c41a'; // 绿色 - 基础组件
      case 'advanced':
        return '#1677ff'; // 蓝色 - 高级组件
      case 'antd':
        return '#fa8c16'; // 橙色 - Ant Design 组件
      default:
        return '#666666'; // 灰色 - 默认
    }
  };

  return (
    <div className="material-icon" style={{ color: getIconColor() }}>
      {iconMap[material.type] || <AppstoreAddOutlined />}
    </div>
  );
};

/**
 * 单个物料项组件
 * 实现拖拽功能，用户可以将物料拖拽到画布上创建组件
 */
const MaterialItem: React.FC<{ material: ComponentDefinition }> = ({
  material,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // 配置拖拽行为
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'MATERIAL', // 拖拽类型，与画布的 useDrop 对应
    item: { type: material.type }, // 拖拽时携带的数据
    collect: (monitor) => ({
      isDragging: monitor.isDragging(), // 收集拖拽状态
    }),
  }));

  // 绑定拖拽功能到 DOM 元素
  drag(ref);

  return (
    <div
      ref={ref}
      className={`material-item ${isDragging ? 'dragging' : ''}`}
      title={material.name} // 鼠标悬停提示
    >
      <IconBox material={material} />
      <div className="material-name">{material.name}</div>
    </div>
  );
};

/**
 * 物料面板主组件
 * 展示所有可用的组件物料，按分类组织
 * 用户可以从这里拖拽组件到画布上进行页面设计
 */
const MaterialPanel: React.FC = () => {
  // 从物料库中获取各分类的组件
  const basic = materialsByCategory['basic'] || [];
  const container = materialsByCategory['container'] || [];
  const advanced = materialsByCategory['advanced'] || [];
  const antd = materialsByCategory['antd'] || [];

  return (
    <div className="material-panel">
      <h4 className="material-panel-title">组件</h4>

      {/* 自定义组件分组 */}
      <h5 style={{ margin: '8px 0' }}>自定义组件</h5>
      <div className="material-category">
        {/* 合并基础、容器、高级组件到自定义分组 */}
        {[...basic, ...container, ...advanced].map((material) => (
          <MaterialItem key={material.type} material={material} />
        ))}
      </div>

      {/* Ant Design 组件分组 */}
      <h5 style={{ margin: '12px 0 8px' }}>Ant Design 组件</h5>
      <div className="material-category">
        {antd.map((material) => (
          <MaterialItem key={material.type} material={material} />
        ))}
      </div>
    </div>
  );
};

export default MaterialPanel;
