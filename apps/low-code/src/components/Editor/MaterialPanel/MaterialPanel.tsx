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
} from '@ant-design/icons';

const iconMap: Record<string, React.ReactNode> = {
  Text: <FontSizeOutlined />,
  Image: <PictureOutlined />,
  Div: <BorderOutlined />,
  FlexContainer: <AppstoreAddOutlined />,
  'antd.Button': <BorderOutlined />,
  'antd.Input': <EditOutlined />,
};

const IconBox: React.FC<{ material: ComponentDefinition }> = ({ material }) => (
  <div className="material-icon">
    {iconMap[material.type] || <AppstoreAddOutlined />}
  </div>
);

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
