import type { ComponentConfig, ComponentProps } from '../../types/editor';
import { serializeStyleForJsx, toStyleValue } from '../styleSerialize';
import type { StyleLike } from '../styleSerialize';

// 生成单个组件的 JSX 内容（不含定位包装）
export const generateInnerJsx = (component: ComponentConfig) => {
  const { type, props } = component as ComponentConfig & {
    props: ComponentProps;
  };

  if (type === 'Text') {
    const { content, fontSize, color, textAlign, type: textType } = props;
    const styleObj = `{{ fontSize: ${fontSize ?? 16}, color: '${
      color ?? '#000'
    }', textAlign: '${textAlign ?? 'left'}' }}`;

    const textContent = content ?? '';

    // 根据文本类型选择对应的 JSX 标签
    switch (textType) {
      case 'h1':
        return `<h1 style=${styleObj}>${textContent}</h1>`;
      case 'h2':
        return `<h2 style=${styleObj}>${textContent}</h2>`;
      case 'h3':
        return `<h3 style=${styleObj}>${textContent}</h3>`;
      case 'p':
        return `<p style=${styleObj}>${textContent}</p>`;
      case 'strong':
        return `<strong style=${styleObj}>${textContent}</strong>`;
      case 'em':
        return `<em style=${styleObj}>${textContent}</em>`;
      default:
        return `<span style=${styleObj}>${textContent}</span>`;
    }
  }

  if (type === 'Image') {
    const { src, alt, width } = props;
    return `<img src="${src ?? ''}" alt="${alt ?? ''}" style={{ width: '${
      width ?? '150px'
    }' }} />`;
  }

  if (type === 'Div') {
    const { content, backgroundColor, padding, borderRadius, width, height } =
      props;
    const divStyle = serializeStyleForJsx({
      backgroundColor: toStyleValue(backgroundColor),
      padding: toStyleValue(padding),
      borderRadius: toStyleValue(borderRadius),
      width: toStyleValue(width),
      height: toStyleValue(height),
    });
    return `<div style={{ ${divStyle} }}>${content ?? ''}</div>`;
  }

  if (type === 'FlexContainer') {
    const {
      direction,
      justifyContent,
      alignItems,
      gap,
      padding,
      backgroundColor,
      minHeight,
      width,
      height,
    } = props;
    const flexStyle = serializeStyleForJsx({
      display: 'flex',
      flexDirection: (direction as string) || 'row',
      justifyContent: (justifyContent as string) || 'flex-start',
      alignItems: (alignItems as string) || 'center',
      gap: toStyleValue(gap),
      padding: toStyleValue(padding),
      backgroundColor: toStyleValue(backgroundColor),
      minHeight: toStyleValue(minHeight),
      width: toStyleValue(width),
      height: toStyleValue(height),
      border: '2px dashed #ccc',
      borderRadius: '4px',
    });
    return `<div style={{ ${flexStyle} }}><div style={{ color: '#999', fontSize: 12 }}>Flex容器 - 可拖入其他组件</div></div>`;
  }

  if (type === 'CustomTable') {
    const { bordered, columnsJson, dataJson } = props;
    
    // 解析表格列配置和数据
    let columns: Array<{ title: string; dataIndex: string }> = [];
    let data: Array<Record<string, unknown>> = [];
    
    try {
      columns = JSON.parse((columnsJson as string) || '[]');
    } catch {
      // 忽略JSON解析错误，使用默认空数组
    }
    
    try {
      data = JSON.parse((dataJson as string) || '[]');
    } catch {
      // 忽略JSON解析错误，使用默认空数组
    }

    // 内层组件填充整个外层容器
    const containerStyle = serializeStyleForJsx({
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'stretch',
    });

    const tableStyle = serializeStyleForJsx({
      width: '100%',
      borderCollapse: 'collapse',
      tableLayout: 'fixed',
    });

    const cellStyle = serializeStyleForJsx({
      border: bordered ? '1px solid #d9d9d9' : 'none',
      padding: '6px 8px',
      fontSize: '12px',
    });

    const headerCellStyle = serializeStyleForJsx({
      border: bordered ? '1px solid #d9d9d9' : 'none',
      padding: '6px 8px',
      fontSize: '12px',
      background: '#fafafa',
      textAlign: 'left',
    });

    // 生成表头JSX
    const theadJsx = columns.length > 0 ? `
        <thead>
          <tr>
            ${columns.map(c => `<th style={{ ${headerCellStyle} }}>${c.title}</th>`).join('')}
          </tr>
        </thead>` : '';

    // 生成表体JSX
    const tbodyJsx = data.length > 0 ? `
        <tbody>
          ${data.map((row, idx) => `
            <tr key={${idx}}>
              ${columns.map(c => `<td style={{ ${cellStyle} }}>${String(row[c.dataIndex] ?? '')}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>` : '';

    return `<div style={{ ${containerStyle} }}>
      <table style={{ ${tableStyle} }} width="100%">${theadJsx}${tbodyJsx}
      </table>
    </div>`;
  }

  if (type === 'BarChart') {
    const { barColor, dataJson } = props;
    
    // 解析图表数据
    let data: Array<{ label: string; value: number }> = [];
    try {
      data = JSON.parse((dataJson as string) || '[]');
    } catch {
      // 忽略JSON解析错误，使用默认空数组
    }

    const maxValue = Math.max(1, ...data.map((d) => Number(d.value) || 0));
    
    // 使用固定的参考尺寸进行计算（因为容器会自动缩放）
    const referenceWidth = 400;
    const referenceHeight = 200;

    const gap = 8;
    const innerPadding = 8;
    const count = Math.max(1, data.length);
    const availableWidth = Math.max(0, referenceWidth - innerPadding * 2 - gap * (count - 1));
    const barWidth = Math.max(16, Math.floor(availableWidth / count));

    // 内层组件填充整个外层容器
    const containerStyle = serializeStyleForJsx({
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
    });

    // 生成柱状图JSX
    const barsJsx = data.map((d, idx) => {
      const h = (Number(d.value) / maxValue) * Math.max(0, referenceHeight - innerPadding * 2 - 24);
      
      const barStyle = serializeStyleForJsx({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      });

      const barRectStyle = serializeStyleForJsx({
        width: `${barWidth}px`,
        height: `${Math.max(2, h)}px`,
        background: (barColor as string) || '#1677ff',
        borderRadius: '4px',
      });

      const labelStyle = serializeStyleForJsx({
        fontSize: '12px',
        textAlign: 'center',
        marginTop: '4px',
      });

      return `
        <div key={${idx}} style={{ ${barStyle} }}>
          <div style={{ ${barRectStyle} }}></div>
          <div style={{ ${labelStyle} }}>${d.label}</div>
        </div>
      `;
    }).join('');

    return `<div style={{ ${containerStyle} }}>${barsJsx}
    </div>`;
  }

  if (type === 'CustomButton') {
    const {
      text = '按钮',
      buttonType = 'primary',
      disabled = false,
      backgroundColor,
      textColor,
      borderColor,
      borderRadius = '6px',
      width = '80px',
      height = '32px',
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
    const buttonStyle = serializeStyleForJsx({
      backgroundColor: toStyleValue(themeStyles.backgroundColor),
      color: toStyleValue(themeStyles.color),
      border: themeStyles.border,
      width: toStyleValue(width),
      height: toStyleValue(height),
      fontSize: toStyleValue(fontSize),
      borderRadius: toStyleValue(borderRadius),
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      outline: 'none',
      padding: '4px 12px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'all 0.2s ease',
    });

    return `<button style={{ ${buttonStyle} }} disabled={${disabled}}>${text}</button>`;
  }

  if (type === 'CustomInput') {
    const {
      placeholder = '请输入',
      value = '',
      inputType = 'text',
      disabled = false,
      width = '200px',
      height = '32px',
      borderRadius = '6px',
      borderColor = '#d9d9d9',
      backgroundColor = '#ffffff',
      textColor = '#000000',
      fontSize = '14px',
    } = props;

    const inputStyle = serializeStyleForJsx({
      width: toStyleValue(width),
      height: toStyleValue(height),
      padding: '4px 12px',
      fontSize: toStyleValue(fontSize),
      color: toStyleValue(textColor),
      backgroundColor: toStyleValue(backgroundColor),
      border: `1px solid ${borderColor}`,
      borderRadius: toStyleValue(borderRadius),
      outline: 'none',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      cursor: disabled ? 'not-allowed' : 'text',
      opacity: disabled ? 0.6 : 1,
    });

    return `<input type="${inputType}" placeholder="${placeholder}" defaultValue="${value}" disabled={${disabled}} style={{ ${inputStyle} }} />`;
  }

  if (type.startsWith('antd.')) {
    const componentName = type.split('.')[1];
    const propsString = Object.entries(props || {})
      .map(([key, value]) => {
        if (key === 'children') return '';
        if (typeof value === 'string') return `${key}="${value}"`;
        if (typeof value === 'boolean') return value ? `${key}` : '';
        return `${key}={${JSON.stringify(value)}}`;
      })
      .filter(Boolean)
      .join(' ');

    const children = props?.children ? props.children : '';
    return `<${componentName} ${propsString}>${children}</${componentName}>`;
  }

  return `<div>未知组件: ${type}</div>`;
};

// 生成带定位包装的 JSX
export const wrapWithPositionJsx = (
  component: ComponentConfig,
  innerJsx: string
) => {
  const baseStyle: StyleLike = {
    position: 'absolute',
  };
  const mergedStyle: StyleLike = {
    ...baseStyle,
    ...(component.style || {}),
  };
  const styleLiteral = serializeStyleForJsx(mergedStyle);
  return `  <div style={{ ${styleLiteral} }}>
    ${innerJsx}
  </div>`;
};
