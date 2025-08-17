import React from 'react';
import type { ComponentProps } from '../../../types/editor';

const CustomTableRenderer: React.FC<{ props: ComponentProps }> = ({
  props,
}) => {
  const { width, height, bordered, columnsJson, dataJson } = props;
  let columns: Array<{ title: string; dataIndex: string }> = [];
  let data: Array<Record<string, unknown>> = [];
  try {
    columns = JSON.parse((columnsJson as string) || '[]');
  } catch {}
  try {
    data = JSON.parse((dataJson as string) || '[]');
  } catch {}
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  };
  const cellStyle: React.CSSProperties = {
    border: bordered ? '1px solid #d9d9d9' : 'none',
    padding: '6px 8px',
    fontSize: 12,
  };
  const wrapStyle: React.CSSProperties = {
    width: (width as string) || '100%',
    height: (height as string) || 'auto',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'stretch',
  };

  return (
    <div style={wrapStyle}>
      <table style={tableStyle} width="100%">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.dataIndex}
                style={{
                  ...cellStyle,
                  background: '#fafafa',
                  textAlign: 'left',
                }}
              >
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map((c) => (
                <td key={c.dataIndex} style={cellStyle}>
                  {String(row[c.dataIndex] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomTableRenderer;
