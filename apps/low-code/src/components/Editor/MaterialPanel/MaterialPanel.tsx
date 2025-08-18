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

const iconMap: Record<string, React.ReactNode> = {
  // 基础组件
  Text: <FontSizeOutlined />,
  Image: <PictureOutlined />,
  Div: <BorderOutlined />,
  FlexContainer: <PartitionOutlined />,

  // 自定义组件
  CustomButton: <PlayCircleOutlined />,
  CustomInput: <EditOutlined />,

  // 高级组件
  CustomTable: <TableOutlined />,
  BarChart: <BarChartOutlined />,

  // Ant Design 组件
  'antd.Button': <BoldOutlined />,
  'antd.Input': <NumberOutlined />,
};

const IconBox: React.FC<{ material: ComponentDefinition }> = ({ material }) => {
  // 根据组件分类设置不同的颜色
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

// 单个物料项
const MaterialItem: React.FC<{ material: ComponentDefinition }> = ({
  material,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'MATERIAL',
    item: { type: material.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  drag(ref);
  return (
    <div
      ref={ref}
      className={`material-item ${isDragging ? 'dragging' : ''}`}
      title={material.name}
    >
      <IconBox material={material} />
      <div className="material-name">{material.name}</div>
    </div>
  );
};

// 物料面板 – 兼作删除区域
const MaterialPanel: React.FC = () => {
  const basic = materialsByCategory['basic'] || [];
  const container = materialsByCategory['container'] || [];
  const advanced = materialsByCategory['advanced'] || [];
  const antd = materialsByCategory['antd'] || [];

  return (
    <div className="material-panel">
      <h4 className="material-panel-title">组件</h4>

      <h5 style={{ margin: '8px 0' }}>自定义组件</h5>
      <div className="material-category">
        {[...basic, ...container, ...advanced].map((material) => (
          <MaterialItem key={material.type} material={material} />
        ))}
      </div>

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
