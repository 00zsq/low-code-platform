import React from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { findMaterial } from '../../../materials';
import { Input, Select, Switch, InputNumber, Button, ColorPicker } from 'antd';
import './PropertyPanel.css';
import type { PropConfig } from '../../../types/editor';

const PropertyPanel: React.FC = () => {
  const { canvas, selectedId, updateComponent, removeComponent } =
    useEditorStore();

  const selectedComponent = canvas.components.find((c) => c.id === selectedId);

  if (!selectedComponent) {
    return (
      <div className="property-panel">
        <h3 className="title">属性面板</h3>
        <p className="emptyTip">请选择一个组件</p>
      </div>
    );
  }

  const material = findMaterial(selectedComponent.type);

  if (!material) {
    return (
      <div className="property-panel">
        <h3 className="title">属性面板</h3>
        <p className="emptyTip">找不到组件定义</p>
      </div>
    );
  }

  const handlePropChange = (name: string, value: PropConfig['type']) => {
    updateComponent(selectedId!, {
      props: {
        ...selectedComponent.props,
        [name]: value,
      },
    });
  };

  return (
    <div className="property-panel">
      <h3 className="title">{selectedComponent.name}</h3>

      <div>
        <h4 className="sectionTitle">组件属性</h4>

        {material.propConfig.map((prop) => (
          <div key={prop.name} style={{ marginBottom: '15px' }}>
            <div style={{ marginBottom: '5px' }}>{prop.label}:</div>

            {prop.type === 'string' && (
              <Input
                value={(selectedComponent.props[prop.name] as string) || ''}
                onChange={(e) =>
                  handlePropChange(
                    prop.name,
                    e.target.value as PropConfig['type']
                  )
                }
              />
            )}

            {prop.type === 'number' && (
              <InputNumber
                value={(selectedComponent.props[prop.name] as number) || 0}
                onChange={(value) =>
                  handlePropChange(prop.name, value as PropConfig['type'])
                }
                style={{ width: '100%' }}
              />
            )}

            {prop.type === 'boolean' && (
              <Switch
                checked={!!selectedComponent.props[prop.name]}
                onChange={(checked) =>
                  handlePropChange(
                    prop.name,
                    checked as unknown as PropConfig['type']
                  )
                }
              />
            )}

            {prop.type === 'select' && prop.options && (
              <Select
                value={selectedComponent.props[prop.name] || prop.defaultValue}
                onChange={(value) =>
                  handlePropChange(prop.name, value as PropConfig['type'])
                }
                style={{ width: '100%' }}
                options={prop.options}
              />
            )}

            {prop.type === 'color' && (
              <ColorPicker
                value={
                  (selectedComponent.props[prop.name] as string) || '#000000'
                }
                onChange={(_, hex) =>
                  handlePropChange(prop.name, hex as PropConfig['type'])
                }
              />
            )}
          </div>
        ))}
      </div>

      <Button
        danger
        className="deleteBtn"
        onClick={() => removeComponent(selectedId!)}
      >
        删除组件
      </Button>
    </div>
  );
};

export default PropertyPanel;
