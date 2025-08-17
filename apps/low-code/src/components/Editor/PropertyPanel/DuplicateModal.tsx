import React from 'react';
import { Modal, Input } from 'antd';
import type { ComponentConfig } from '../../../types/editor';
import { useEditorStore } from '../../../store/editorStore';

interface DuplicateModalProps {
  open: boolean;
  selectedComponent: ComponentConfig | null;
  onClose: () => void;
}

const DuplicateModal: React.FC<DuplicateModalProps> = ({
  open,
  selectedComponent,
  onClose,
}) => {
  const { duplicateComponent } = useEditorStore();

  // local states for different component types
  const [dupJson, setDupJson] = React.useState<string>('{}');
  const [dupBarValuesText, setDupBarValuesText] = React.useState<string>('');
  const [dupBarLabelsText, setDupBarLabelsText] = React.useState<string>('');
  const [dupTableColsText, setDupTableColsText] = React.useState<string>('');
  const [dupTableDataText, setDupTableDataText] = React.useState<string>('');

  React.useEffect(() => {
    if (!open || !selectedComponent) return;
    if (selectedComponent.type === 'BarChart') {
      try {
        const arr = JSON.parse(
          ((selectedComponent.props as Record<string, unknown>)
            .dataJson as string) || '[]'
        ) as Array<{ label: string; value: number }>;
        setDupBarValuesText(JSON.stringify(arr.map((d) => d.value)));
        setDupBarLabelsText(JSON.stringify(arr.map((d) => d.label)));
      } catch {
        setDupBarValuesText('[]');
        setDupBarLabelsText('[]');
      }
    } else if (selectedComponent.type === 'CustomTable') {
      try {
        const cols = JSON.parse(
          ((selectedComponent.props as Record<string, unknown>)
            .columnsJson as string) || '[]'
        ) as Array<{ title: string; dataIndex: string }>;
        const rows = JSON.parse(
          ((selectedComponent.props as Record<string, unknown>)
            .dataJson as string) || '[]'
        ) as Array<Record<string, unknown>>;
        const titles = cols.map((c) => c.title);
        const matrix = rows.map((r) => cols.map((c) => r[c.dataIndex]));
        setDupTableColsText(JSON.stringify(titles));
        setDupTableDataText(JSON.stringify(matrix));
      } catch {
        setDupTableColsText('[]');
        setDupTableDataText('[]');
      }
    } else {
      setDupJson(JSON.stringify(selectedComponent.props, null, 2));
    }
  }, [open, selectedComponent]);

  const handleOk = () => {
    if (!selectedComponent) return;
    try {
      if (selectedComponent.type === 'BarChart') {
        const values = JSON.parse(dupBarValuesText || '[]') as number[];
        const labels = JSON.parse(dupBarLabelsText || '[]') as string[];
        const len = Math.min(values.length, labels.length);
        const data = Array.from({ length: len }).map((_, i) => ({
          label: labels[i],
          value: values[i],
        }));
        const nextProps = {
          ...selectedComponent.props,
          dataJson: JSON.stringify(data),
        };
        duplicateComponent(selectedComponent.id, { props: nextProps });
      } else if (selectedComponent.type === 'CustomTable') {
        const titles = JSON.parse(dupTableColsText || '[]') as string[];
        const matrix = JSON.parse(dupTableDataText || '[]') as Array<unknown[]>;
        const columns = titles.map((t, i) => ({
          title: t,
          dataIndex: `col${i}`,
        }));
        const data = (matrix || []).map((row) => {
          const obj: Record<string, unknown> = {};
          titles.forEach((_, i) => {
            obj[`col${i}`] = row?.[i];
          });
          return obj;
        });
        const nextProps = {
          ...selectedComponent.props,
          columnsJson: JSON.stringify(columns),
          dataJson: JSON.stringify(data),
        };
        duplicateComponent(selectedComponent.id, { props: nextProps });
      } else {
        const parsedProps = JSON.parse(dupJson) as Record<string, unknown>;
        if (
          Array.isArray(
            (parsedProps as Record<string, unknown>).columns as unknown[]
          )
        ) {
          (parsedProps as Record<string, unknown>).columnsJson = JSON.stringify(
            (parsedProps as Record<string, unknown>).columns
          );
          delete (parsedProps as Record<string, unknown>).columns;
        }
        if (
          Array.isArray(
            (parsedProps as Record<string, unknown>).data as unknown[]
          )
        ) {
          (parsedProps as Record<string, unknown>).dataJson = JSON.stringify(
            (parsedProps as Record<string, unknown>).data
          );
          delete (parsedProps as Record<string, unknown>).data;
        }
        duplicateComponent(selectedComponent.id, { props: parsedProps });
      }
      onClose();
    } catch {
      // ignore parse errors
    }
  };

  return (
    <Modal
      open={open}
      title="复制并修改"
      onCancel={onClose}
      onOk={handleOk}
      okText="确定"
      cancelText="取消"
      width={520}
    >
      {!selectedComponent ? null : selectedComponent.type === 'BarChart' ? (
        <div>
          <div style={{ marginBottom: 8, color: '#999', fontSize: 12 }}>
            请输入数组，不需要字段名与反斜杠。例如：值数组 [23,61,35]，标签数组
            ["A","B","C"]。
          </div>
          <div style={{ marginBottom: 6, color: '#666', fontSize: 12 }}>
            值数组
          </div>
          <Input.TextArea
            value={dupBarValuesText}
            onChange={(e) => setDupBarValuesText(e.target.value)}
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
          <div style={{ margin: '10px 0 6px', color: '#666', fontSize: 12 }}>
            标签数组
          </div>
          <Input.TextArea
            value={dupBarLabelsText}
            onChange={(e) => setDupBarLabelsText(e.target.value)}
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </div>
      ) : selectedComponent.type === 'CustomTable' ? (
        <div>
          <div style={{ marginBottom: 8, color: '#999', fontSize: 12 }}>
            请输入数组，不需要反斜杠。列名与数据均输入为数组。
          </div>
          <div style={{ marginBottom: 6, color: '#666', fontSize: 12 }}>
            列名数组（如: ["名称","年龄"]）
          </div>
          <Input.TextArea
            value={dupTableColsText}
            onChange={(e) => setDupTableColsText(e.target.value)}
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
          <div style={{ margin: '10px 0 6px', color: '#666', fontSize: 12 }}>
            数据二维数组（如: [["张三",28],["李四",22]]）
          </div>
          <Input.TextArea
            value={dupTableDataText}
            onChange={(e) => setDupTableDataText(e.target.value)}
            autoSize={{ minRows: 4, maxRows: 10 }}
          />
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
            仅支持编辑 props 字段，其余字段将被忽略。JSON
            字段可直接输入对象/数组，系统会自动序列化。
          </div>
          <Input.TextArea
            value={dupJson}
            onChange={(e) => setDupJson(e.target.value)}
            autoSize={{ minRows: 10, maxRows: 18 }}
          />
        </div>
      )}
    </Modal>
  );
};

export default DuplicateModal;
