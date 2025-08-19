import React, { useState } from 'react';
import type { LowCodeSchema, LowCodeNode } from '../../types';
import { safeEvalFunction } from '../../utils/safeEval';

interface JsonPreviewProps {
  code: string;
}

// 简化的组件渲染器，只支持基本组件预览
function SimpleRenderer({ schema }: { schema: LowCodeSchema }): React.ReactElement {
  const [state, setState] = useState<Record<string, any>>({});

  const renderNode = (node: LowCodeNode): React.ReactNode => {
    const { type, props = {}, children = [] } = node;
    const commonProps: any = {};
    if (props.style && typeof props.style === 'object')
      commonProps.style = props.style;
    if (props.className) commonProps.className = props.className;

    switch (type) {
      case 'Text':
        return (
          <span 
            {...commonProps} 
            style={{ 
              fontSize: 14, 
              color: 'var(--text)',
              padding: '4px 8px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              display: 'inline-block',
              margin: '2px',
              ...commonProps.style 
            }}
          >
            {props.content || props.children || '文本'}
          </span>
        );
      
      case 'Button':
      case 'CustomButton': {
        const onClick = safeEvalFunction(props.onClick);
        return (
          <button
            {...commonProps}
            onClick={(e) => onClick?.(e, state, setState)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--primary)',
              backgroundColor: 'var(--primary)',
              color: 'white',
              cursor: 'pointer',
              margin: '4px',
              fontWeight: 500,
              fontSize: '13px',
              transition: 'var(--transition)',
              ...commonProps.style,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {props.text || props.children || '按钮'}
          </button>
        );
      }
      
      case 'Input':
      case 'CustomInput':
        return (
          <input
            {...commonProps}
            type="text"
            placeholder={props.placeholder || '请输入'}
            style={{
              padding: '8px 12px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: 'var(--panel)',
              color: 'var(--text)',
              margin: '4px',
              fontSize: '14px',
              transition: 'var(--transition)',
              ...commonProps.style,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        );
      
      case 'Image':
        return (
          <div
            style={{
              display: 'inline-block',
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius)',
              padding: '8px',
              margin: '4px',
              background: 'var(--bg-secondary)',
              ...commonProps.style,
            }}
          >
            <img
              {...commonProps}
              src={props.src || 'https://via.placeholder.com/120x80/3b82f6/ffffff?text=Image'}
              alt={props.alt || '图片'}
              style={{
                maxWidth: '120px',
                height: 'auto',
                borderRadius: 'var(--radius-sm)',
                display: 'block',
              }}
            />
          </div>
        );
      
      case 'Div':
      case 'Container':
      case 'View':
        return (
          <div
            {...commonProps}
            style={{
              padding: '12px',
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--bg-secondary)',
              minHeight: '60px',
              margin: '8px 4px',
              position: 'relative',
              ...commonProps.style,
            }}
          >
            <div style={{
              position: 'absolute',
              top: '4px',
              left: '8px',
              fontSize: '10px',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--panel)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
            }}>
              容器
            </div>
            <div style={{ marginTop: '16px' }}>
              {props.content || (children.length > 0 ? 
                children.map((child) => (
                  <React.Fragment key={child.id}>
                    {renderNode(child)}
                  </React.Fragment>
                )) : 
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>空容器</span>
              )}
            </div>
          </div>
        );
      
      // 对于复杂组件，显示美化的组件占位符
      case 'CustomTable':
        return (
          <div
            {...commonProps}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '16px',
              textAlign: 'center',
              backgroundColor: 'var(--panel)',
              margin: '8px 4px',
              minWidth: '200px',
              ...commonProps.style,
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>
              表格组件
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {type}
            </div>
          </div>
        );
      
      case 'BarChart':
        return (
          <div
            {...commonProps}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '16px',
              textAlign: 'center',
              backgroundColor: 'var(--panel)',
              margin: '8px 4px',
              minWidth: '200px',
              ...commonProps.style,
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>
              柱状图组件
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {type}
            </div>
          </div>
        );
      
      case 'FlexContainer':
        return (
          <div
            {...commonProps}
            style={{
              display: 'flex',
              flexDirection: props.direction || 'row',
              gap: '8px',
              padding: '12px',
              border: '2px dashed var(--primary)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              margin: '8px 4px',
              position: 'relative',
              minHeight: '80px',
              ...commonProps.style,
            }}
          >
            <div style={{
              position: 'absolute',
              top: '4px',
              left: '8px',
              fontSize: '10px',
              color: 'var(--primary)',
              backgroundColor: 'var(--panel)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--primary)',
              fontWeight: '500',
            }}>
              Flex容器
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
              {children.length > 0 ? (
                children.map((child) => (
                  <React.Fragment key={child.id}>
                    {renderNode(child)}
                  </React.Fragment>
                ))
              ) : (
                <span style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: '12px', 
                  fontStyle: 'italic',
                  padding: '8px'
                }}>
                  可放置其他组件
                </span>
              )}
            </div>
          </div>
        );

      // Ant Design 组件
      default:
        if (type.startsWith('antd.')) {
          const componentName = type.split('.')[1];
          return (
            <div
              {...commonProps}
              style={{
                padding: '12px 16px',
                border: '1px solid var(--primary)',
                borderRadius: 'var(--radius)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--primary)',
                display: 'inline-block',
                margin: '4px',
                fontWeight: '500',
                fontSize: '13px',
                ...commonProps.style,
              }}
            >
              <span style={{ marginRight: '6px' }}>🐜</span>
              {componentName}
              <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
                {type}
              </div>
            </div>
          );
        }
        
        return (
          <div
            {...commonProps}
            style={{
              padding: '12px 16px',
              border: '1px solid var(--error)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--error)',
              margin: '4px',
              fontSize: '13px',
              fontWeight: '500',
              ...commonProps.style,
            }}
          >
            <span style={{ marginRight: '6px' }}>❓</span>
            未知组件: {type}
          </div>
        );
    }
  };

  return (
    <div style={{ 
      padding: 20, 
      background: 'var(--bg)', 
      color: 'var(--text)', 
      minHeight: '100%',
      fontFamily: 'var(--font-family)',
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
        <span>🔍</span>
        JSON Schema 预览 (简化渲染) - {schema.components?.length || 0} 个组件
      </div>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px' 
      }}>
        {schema.components?.map((node) => (
          <div key={node.id} style={{ 
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            {renderNode(node)}
          </div>
        )) || (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--text-muted)',
            fontSize: '14px'
          }}>
            没有找到组件
          </div>
        )}
      </div>
    </div>
  );
}

export default function JsonPreview({ code }: JsonPreviewProps): React.ReactElement {
  try {
    const data = JSON.parse(code);
    if (data && Array.isArray(data.components)) {
      return <SimpleRenderer schema={data} />;
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