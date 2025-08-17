import React from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { findMaterial } from '../../../materials';
import { Input, Select, Switch, InputNumber, Button, ColorPicker } from 'antd';
import DuplicateModal from './DuplicateModal';
import './PropertyPanel.css';
import type { PropConfig } from '../../../types/editor';

const PropertyPanel: React.FC = () => {
  const {
    canvas,
    selectedId,
    updateComponent,
    removeComponent,
    // duplicateComponent,
  } = useEditorStore();
  // Hooks 必须在组件顶层调用，避免条件分支导致顺序变化
  const [isDupOpen, setDupOpen] = React.useState(false);
  // duplicate modal state moved out
  // BarChart 简化输入：属性面板与弹窗共用
  const [barValuesText, setBarValuesText] = React.useState<string>('');
  const [barLabelsText, setBarLabelsText] = React.useState<string>('');
  // removed duplicate-related local states

  const selectedComponent = canvas.components.find((c) => c.id === selectedId);

  React.useEffect(() => {
    if (!selectedComponent) return;
    if (selectedComponent.type === 'BarChart') {
      try {
        const arr = JSON.parse(
          (selectedComponent.props.dataJson as string) || '[]'
        ) as Array<{ label: string; value: number }>;
        const values = arr.map((d) => d.value);
        const labels = arr.map((d) => d.label);
        setBarValuesText(JSON.stringify(values));
        setBarLabelsText(JSON.stringify(labels));
      } catch {
        setBarValuesText('[]');
        setBarLabelsText('[]');
      }
    } else {
      setBarValuesText('');
      setBarLabelsText('');
    }
    // CustomTable 的属性面板简化输入已移除，这里不再维护本地镜像状态
  }, [selectedComponent]);

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

  const openDuplicate = () => setDupOpen(true);

  // 复制逻辑已迁移到 DuplicateModal
  // handled inside DuplicateModal

  return (
    <div className="property-panel">
      <h3 className="title">{selectedComponent.name}</h3>

      <div>
        <h4 className="sectionTitle">组件属性</h4>

        {/* BarChart 简化数据编辑：以数组形式编辑 */}
        {selectedComponent.type === 'BarChart' && (
          <div style={{ marginBottom: '15px' }}>
            <div style={{ marginBottom: 6, color: '#666', fontSize: 12 }}>
              值数组（如: [23,61,35,77,35]）
            </div>
            <Input.TextArea
              value={barValuesText}
              onChange={(e) => {
                setBarValuesText(e.target.value);
                try {
                  const values = JSON.parse(e.target.value || '[]') as number[];
                  const labels = JSON.parse(barLabelsText || '[]') as string[];
                  const len = Math.min(values.length, labels.length);
                  const data = Array.from({ length: len }).map((_, i) => ({
                    label: labels[i],
                    value: values[i],
                  }));
                  updateComponent(selectedId!, {
                    props: {
                      ...selectedComponent.props,
                      dataJson: JSON.stringify(data),
                    },
                  });
                } catch {
                  // ignore parse errors
                }
              }}
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
            <div style={{ margin: '10px 0 6px', color: '#666', fontSize: 12 }}>
              标签数组（如: ["A","B","C","D","E"]）
            </div>
            <Input.TextArea
              value={barLabelsText}
              onChange={(e) => {
                setBarLabelsText(e.target.value);
                try {
                  const values = JSON.parse(barValuesText || '[]') as number[];
                  const labels = JSON.parse(e.target.value || '[]') as string[];
                  const len = Math.min(values.length, labels.length);
                  const data = Array.from({ length: len }).map((_, i) => ({
                    label: labels[i],
                    value: values[i],
                  }));
                  updateComponent(selectedId!, {
                    props: {
                      ...selectedComponent.props,
                      dataJson: JSON.stringify(data),
                    },
                  });
                } catch {
                  // ignore parse errors
                }
              }}
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </div>
        )}

        {(selectedComponent.type === 'BarChart'
          ? material.propConfig.filter((p) => p.name !== 'dataJson')
          : selectedComponent.type === 'CustomTable'
          ? material.propConfig.filter(
              (p) => p.name !== 'columnsJson' && p.name !== 'dataJson'
            )
          : material.propConfig
        ).map((prop) => (
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

      <Button style={{ marginRight: 8 }} onClick={openDuplicate}>
        复制并修改
      </Button>
      <Button
        danger
        className="deleteBtn"
        onClick={() => removeComponent(selectedId!)}
      >
        删除组件
      </Button>

      {/* 复制并修改弹窗（解耦） */}
      <DuplicateModal
        open={isDupOpen}
        selectedComponent={selectedComponent}
        onClose={() => setDupOpen(false)}
      />
    </div>
  );
};

export default PropertyPanel;
