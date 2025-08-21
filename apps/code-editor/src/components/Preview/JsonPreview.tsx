import React, { useState, useEffect, useRef } from 'react';
import type { LowCodeSchema } from '../../types';

interface JsonPreviewProps {
  code: string;
}

// 低代码组件渲染器 - 100%还原低代码平台效果
function LowCodeRenderer({ schema }: { schema: LowCodeSchema }): React.ReactElement {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取画布实际尺寸
  const canvasWidth = (schema as any).style?.width || 1200;
  const canvasHeight = (schema as any).style?.height || 740;
  const canvasBackground = (schema as any).style?.backgroundColor || '#ffffff';

  // 动态计算缩放比例
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        // 减去padding和一些边距
        const availableWidth = containerRect.width - 22; // 10px padding + 1px border * 2
        const availableHeight = containerRect.height - 22;
        
        if (availableWidth > 0 && availableHeight > 0) {
          const scaleX = availableWidth / canvasWidth;
          const scaleY = availableHeight / canvasHeight;
          const newScale = Math.min(scaleX, scaleY, 1); // 最大不超过1
          
          setScale(newScale);
        }
      }
    };

    // 延迟执行，确保DOM已渲染
    const timer = setTimeout(updateScale, 100);
    
    window.addEventListener('resize', updateScale);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScale);
    };
  }, [canvasWidth, canvasHeight]);

  // 缩放后的实际显示尺寸
  const scaledWidth = canvasWidth * scale;
  const scaledHeight = canvasHeight * scale;

  // 画布样式
  const canvasStyle: React.CSSProperties = {
    position: 'relative',
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    backgroundColor: canvasBackground,
    transformOrigin: 'top left',
    transform: `scale(${scale})`,
  };

  // 渲染单个组件内容（不包含定位）
  const renderComponentContent = (component: any): React.ReactNode => {
    const { type, props = {} } = component;

    switch (type) {
      case 'Text': {
        const { content, fontSize, color, textAlign, type: textType } = props;
        const style: React.CSSProperties = {
          fontSize: fontSize || 16,
          color: color || '#000000',
          textAlign: textAlign || 'left',
          margin: 0,
          padding: 0,
        };

        // 根据文本类型选择对应的标签
        switch (textType) {
          case 'h1':
            return <h1 style={style}>{content || '标题1'}</h1>;
          case 'h2':
            return <h2 style={style}>{content || '标题2'}</h2>;
          case 'h3':
            return <h3 style={style}>{content || '标题3'}</h3>;
          case 'p':
            return <p style={style}>{content || '段落'}</p>;
          case 'strong':
            return <strong style={style}>{content || '粗体文本'}</strong>;
          case 'em':
            return <em style={style}>{content || '斜体文本'}</em>;
          default:
            return <span style={style}>{content || '文本'}</span>;
        }
      }

      case 'CustomButton': {
        const {
          text = '按钮',
          buttonType = 'primary',
          disabled = false,
          backgroundColor,
          textColor,
          borderColor,
          borderRadius = '6px',
          fontSize = '14px',
        } = props;

        // 根据按钮类型设置样式
        const getThemeStyles = () => {
          switch (buttonType) {
            case 'primary':
              return {
                backgroundColor: backgroundColor || '#1677ff',
                color: textColor || '#ffffff',
                border: `1px solid ${borderColor || '#1677ff'}`,
              };
            case 'danger':
              return {
                backgroundColor: backgroundColor || '#ff4d4f',
                color: textColor || '#ffffff',
                border: `1px solid ${borderColor || '#ff4d4f'}`,
              };
            case 'success':
              return {
                backgroundColor: backgroundColor || '#52c41a',
                color: textColor || '#ffffff',
                border: `1px solid ${borderColor || '#52c41a'}`,
              };
            case 'warning':
              return {
                backgroundColor: backgroundColor || '#faad14',
                color: textColor || '#ffffff',
                border: `1px solid ${borderColor || '#faad14'}`,
              };
            case 'ghost':
              return {
                backgroundColor: 'transparent',
                color: textColor || '#1677ff',
                border: `1px solid ${borderColor || '#1677ff'}`,
              };
            default:
              return {
                backgroundColor: backgroundColor || '#ffffff',
                color: textColor || '#000000',
                border: `1px solid ${borderColor || '#d9d9d9'}`,
              };
          }
        };

        const themeStyles = getThemeStyles();
        const buttonStyle: React.CSSProperties = {
          width: '100%',
          height: '100%',
          fontSize: fontSize,
          borderRadius: borderRadius,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          outline: 'none',
          padding: '4px 12px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          ...themeStyles,
        };

        return (
          <button style={buttonStyle} disabled={disabled}>
            {text}
          </button>
        );
      }

      case 'CustomInput': {
        const {
          placeholder = '请输入',
          value = '',
          inputType = 'text',
          disabled = false,
          borderRadius = '6px',
          borderColor = '#d9d9d9',
          backgroundColor = '#ffffff',
          textColor = '#000000',
          fontSize = '14px',
        } = props;

        const inputStyle: React.CSSProperties = {
          width: '100%',
          height: '100%',
          padding: '4px 12px',
          fontSize: fontSize,
          color: textColor,
          backgroundColor: backgroundColor,
          border: `1px solid ${borderColor}`,
          borderRadius: borderRadius,
          outline: 'none',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.6 : 1,
          boxSizing: 'border-box',
        };

        return (
          <input
            type={inputType}
            placeholder={placeholder}
            defaultValue={value}
            disabled={disabled}
            style={inputStyle}
          />
        );
      }

      case 'Image': {
        const { src, alt, width } = props;
        return (
          <img
            src={src || 'https://via.placeholder.com/150x100/e5e7eb/6b7280?text=Image'}
            alt={alt || '图片'}
            style={{
              width: width || '150px',
              height: 'auto',
              display: 'block',
            }}
          />
        );
      }

      case 'Div': {
        const { content, backgroundColor, padding, borderRadius } = props;
        const divStyle: React.CSSProperties = {
          backgroundColor: backgroundColor || '#fafafa',
          padding: padding || '12px',
          borderRadius: borderRadius || '6px',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
        };
        return <div style={divStyle}>{content || '容器内容'}</div>;
      }

      case 'FlexContainer': {
        const {
          direction = 'row',
          justifyContent = 'flex-start',
          alignItems = 'center',
          gap = '8px',
          padding = '8px',
          backgroundColor = '#fff',
          minHeight = '80px',
        } = props;

        const flexStyle: React.CSSProperties = {
          display: 'flex',
          flexDirection: direction as any,
          justifyContent: justifyContent as any,
          alignItems: alignItems as any,
          gap: gap,
          padding: padding,
          backgroundColor: backgroundColor,
          minHeight: minHeight,
          width: '100%',
          height: '100%',
          border: '2px dashed #ccc',
          borderRadius: '4px',
          boxSizing: 'border-box',
        };

        return (
          <div style={flexStyle}>
            <div style={{ color: '#999', fontSize: 12 }}>
              Flex容器 - 可拖入其他组件
            </div>
          </div>
        );
      }

      case 'CustomTable': {
        const { bordered, columnsJson, dataJson } = props;
        
        // 解析表格列配置和数据
        let columns: Array<{ title: string; dataIndex: string }> = [];
        let data: Array<Record<string, unknown>> = [];
        
        try {
          columns = JSON.parse(columnsJson || '[]');
        } catch {}
        
        try {
          data = JSON.parse(dataJson || '[]');
        } catch {}

        const tableStyle: React.CSSProperties = {
          width: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
        };

        const cellStyle: React.CSSProperties = {
          border: bordered ? '1px solid #d9d9d9' : 'none',
          padding: '6px 8px',
          fontSize: '12px',
        };

        const wrapStyle: React.CSSProperties = {
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'stretch',
        };

        return (
          <div style={wrapStyle}>
            <table style={tableStyle}>
              {columns.length > 0 && (
                <thead>
                  <tr>
                    {columns.map((c, idx) => (
                      <th
                        key={idx}
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
              )}
              {data.length > 0 && (
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx}>
                      {columns.map((c, colIdx) => (
                        <td key={colIdx} style={cellStyle}>
                          {String(row[c.dataIndex] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        );
      }

      case 'BarChart': {
        const { barColor, dataJson } = props;
        
        // 解析图表数据
        let data: Array<{ label: string; value: number }> = [];
        try {
          data = JSON.parse(dataJson || '[]');
        } catch {}

        const maxValue = Math.max(1, ...data.map((d) => Number(d.value) || 0));
        
        // 使用固定的参考尺寸进行计算
        const referenceWidth = 400;
        const referenceHeight = 200;
        const gap = 8;
        const innerPadding = 8;
        const count = Math.max(1, data.length);
        const availableWidth = Math.max(0, referenceWidth - innerPadding * 2 - gap * (count - 1));
        const barWidth = Math.max(16, Math.floor(availableWidth / count));

        const containerStyle: React.CSSProperties = {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          padding: '8px',
          border: '1px solid #eee',
          borderRadius: '6px',
          background: '#fff',
          overflow: 'hidden',
          boxSizing: 'border-box',
        };

        return (
          <div style={containerStyle}>
            {data.map((d, idx) => {
              const h = (Number(d.value) / maxValue) * Math.max(0, referenceHeight - innerPadding * 2 - 24);
              
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: `${barWidth}px`,
                      height: `${Math.max(2, h)}px`,
                      background: barColor || '#1677ff',
                      borderRadius: '4px',
                    }}
                  />
                  <div
                    style={{
                      fontSize: '12px',
                      textAlign: 'center',
                      marginTop: '4px',
                    }}
                  >
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      default:
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ff4d4f',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 77, 79, 0.1)',
              color: '#ff4d4f',
              fontSize: '12px',
            }}
          >
            未知组件: {type}
          </div>
        );
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        overflow: 'hidden',
        padding: '10px',
        boxSizing: 'border-box',
        minHeight: '200px',
      }}
    >
      {/* 画布容器 */}
      <div style={{
        position: 'relative',
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        border: '1px solid #d9d9d9',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        backgroundColor: canvasBackground,
        flexShrink: 0,
      }}>
        <div style={canvasStyle}>
          {schema.components?.map((component) => {
            // 外层容器使用 component.style 的定位和尺寸
            const containerStyle: React.CSSProperties = {
              position: 'absolute',
              left: (component as any).style?.left || '0px',
              top: (component as any).style?.top || '0px',
              width: (component as any).style?.width || 'auto',
              height: (component as any).style?.height || 'auto',
            };

            return (
              <div key={component.id} style={containerStyle}>
                {renderComponentContent(component)}
              </div>
            );
          }) || (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#999',
              fontSize: '16px'
            }}>
              没有找到组件
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JsonPreview({ code }: JsonPreviewProps): React.ReactElement {
  try {
    const data = JSON.parse(code);
    if (data && Array.isArray(data.components)) {
      return <LowCodeRenderer schema={data} />;
    }
    // 如果不是标准 schema，就展示原始 JSON
    return (
      <div style={{ 
        background: 'var(--bg)', 
        color: 'var(--text)', 
        height: '100%', 
        overflow: 'auto',
        padding: '20px'
      }}>
        <div style={{ 
          marginBottom: 16, 
          fontSize: 12, 
          color: 'var(--text-muted)',
          padding: '8px 12px',
          background: 'var(--panel)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>📄</span>
          原始 JSON 数据
        </div>
        <pre style={{ 
          padding: 20, 
          margin: 0, 
          fontSize: 12, 
          lineHeight: 1.6,
          background: 'var(--panel)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
          overflow: 'auto'
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  } catch (e) {
    return (
      <div style={{ 
        background: 'var(--bg)', 
        color: 'var(--text)', 
        height: '100%', 
        padding: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          border: '2px dashed var(--error)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px', color: 'var(--error)' }}>
            JSON 解析错误
          </div>
          <pre style={{ 
            color: 'var(--error)', 
            fontSize: 12,
            backgroundColor: 'var(--panel)',
            padding: '12px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--error)',
            fontFamily: "'JetBrains Mono', monospace",
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {String(e)}
          </pre>
        </div>
      </div>
    );
  }
} 