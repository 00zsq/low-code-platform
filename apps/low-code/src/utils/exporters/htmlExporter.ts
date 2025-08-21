import type { ComponentConfig, ComponentProps } from '../../types/editor';
import { serializeStyleForHtml, toStyleValue } from '../styleSerialize';

export const generateComponentHtml = (component: ComponentConfig) => {
  const { type, props } = component as ComponentConfig & {
    props: ComponentProps;
  };

  if (type === 'Text') {
    const { content, fontSize, color, textAlign, type: textType } = props || {};
    const styleAttr = `font-size: ${fontSize ?? 16}px; color: ${
      color ?? '#000'
    }; text-align: ${textAlign ?? 'left'};`;

    const textContent = content ?? '';

    // 根据文本类型选择对应的 HTML 标签
    switch (textType) {
      case 'h1':
        return `<h1 style="${styleAttr}">${textContent}</h1>`;
      case 'h2':
        return `<h2 style="${styleAttr}">${textContent}</h2>`;
      case 'h3':
        return `<h3 style="${styleAttr}">${textContent}</h3>`;
      case 'p':
        return `<p style="${styleAttr}">${textContent}</p>`;
      case 'strong':
        return `<strong style="${styleAttr}">${textContent}</strong>`;
      case 'em':
        return `<em style="${styleAttr}">${textContent}</em>`;
      default:
        return `<span style="${styleAttr}">${textContent}</span>`;
    }
  }

  if (type === 'Image') {
    const { src, alt, width } = props || {};
    return `<img src="${src ?? ''}" alt="${alt ?? ''}" style="width: ${
      width ?? '150px'
    };" />`;
  }

  if (type === 'Div') {
    const { content, backgroundColor, padding, borderRadius, width, height } =
      (props || {}) as Record<string, unknown>;
    const style = serializeStyleForHtml({
      backgroundColor: toStyleValue(backgroundColor),
      padding: toStyleValue(padding),
      borderRadius: toStyleValue(borderRadius),
      width: toStyleValue(width),
      height: toStyleValue(height),
    });
    return `<div style="${style}">${String(content ?? '')}</div>`;
  }

  if (type === 'CustomTable') {
    const { bordered, columnsJson, dataJson } = (props || {}) as Record<string, unknown>;
    
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

    const tableStyle = serializeStyleForHtml({
      width: '100%',
      borderCollapse: 'collapse',
      tableLayout: 'fixed',
    });

    const cellStyle = serializeStyleForHtml({
      border: bordered ? '1px solid #d9d9d9' : 'none',
      padding: '6px 8px',
      fontSize: '12px',
    });

    const headerCellStyle = serializeStyleForHtml({
      border: bordered ? '1px solid #d9d9d9' : 'none',
      padding: '6px 8px',
      fontSize: '12px',
      background: '#fafafa',
      textAlign: 'left',
    });

    // 内层组件填充整个外层容器
    const wrapStyle = serializeStyleForHtml({
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'stretch',
    });

    // 生成表头
    const thead = columns.length > 0 ? `
        <thead>
          <tr>
            ${columns.map(c => `<th style="${headerCellStyle}">${c.title}</th>`).join('')}
          </tr>
        </thead>` : '';

    // 生成表体
    const tbody = data.length > 0 ? `
        <tbody>
          ${data.map(row => `
            <tr>
              ${columns.map(c => `<td style="${cellStyle}">${String(row[c.dataIndex] ?? '')}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>` : '';

    return `<div style="${wrapStyle}"><table style="${tableStyle}">${thead}${tbody}</table></div>`;
  }

  if (type === 'BarChart') {
    const { barColor, dataJson } = (props || {}) as Record<string, unknown>;
    
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
    const containerStyle = serializeStyleForHtml({
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

    // 生成柱状图HTML
    const barsHtml = data.map((d) => {
      const h = (Number(d.value) / maxValue) * Math.max(0, referenceHeight - innerPadding * 2 - 24);
      const barStyle = serializeStyleForHtml({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      });
      const barRectStyle = serializeStyleForHtml({
        width: `${barWidth}px`,
        height: `${Math.max(2, h)}px`,
        background: (barColor as string) || '#1677ff',
        borderRadius: '4px',
      });
      const labelStyle = serializeStyleForHtml({
        fontSize: '12px',
        textAlign: 'center',
        marginTop: '4px',
      });
      
      return `
        <div style="${barStyle}">
          <div style="${barRectStyle}"></div>
          <div style="${labelStyle}">${d.label}</div>
        </div>
      `;
    }).join('');

    return `<div style="${containerStyle}">${barsHtml}</div>`;
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
    } = (props || {}) as Record<string, unknown>;

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
    const style = serializeStyleForHtml({
      backgroundColor: toStyleValue(themeStyles.backgroundColor),
      color: toStyleValue(themeStyles.color),
      border: themeStyles.border,
      width: toStyleValue(width),
      height: toStyleValue(height),
      fontSize: toStyleValue(fontSize),
      borderRadius: toStyleValue(borderRadius),
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? '0.6' : '1',
      outline: 'none',
      padding: '4px 12px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      whiteSpace: 'nowrap',
      userSelect: 'none',
    });

    return `<button style="${style}" ${disabled ? 'disabled' : ''}>${String(
      text
    )}</button>`;
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
    } = (props || {}) as Record<string, unknown>;

    const style = serializeStyleForHtml({
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
      opacity: disabled ? '0.6' : '1',
      boxSizing: 'border-box',
    });

    return `<input type="${String(inputType)}" placeholder="${String(
      placeholder
    )}" value="${String(value)}" ${
      disabled ? 'disabled' : ''
    } style="${style}" />`;
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
    } = (props || {}) as Record<string, unknown>;
    const style = serializeStyleForHtml({
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
    return `<div style="${style}"><div style="color: #999; font-size: 12px">Flex容器 - 可拖入其他组件</div></div>`;
  }

  if (type.startsWith('antd.')) {
    const componentName = type.split('.')[1];
    if (componentName === 'Button') {
      const { children, type: btnType } = props || {};
      return `<button class="ant-btn ant-btn-${btnType || 'default'}">${
        children || 'Button'
      }</button>`;
    }
    if (componentName === 'Input') {
      const { placeholder } = props || {};
      return `<input type="text" class="ant-input" placeholder="${
        placeholder || ''
      }" />`;
    }
  }
  return `<div>未知组件: ${type}</div>`;
};

export const generateHtmlTemplate = (
  componentsHtml: string,
  containerStyle: string
) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Page</title>
  <style>
    /* minimal antd-like styles for export */
    .ant-btn { display: inline-flex; align-items: center; justify-content: center; padding: 4px 15px; border: 1px solid #d9d9d9; background: #fff; color: rgba(0,0,0,0.88); border-radius: 6px; cursor: pointer; font-size: 14px; line-height: 22px; }
    .ant-btn-primary { background: #1677ff; border-color: #1677ff; color: #fff; }
    .ant-btn-dashed { border-style: dashed; }
    .ant-btn-link { border-color: transparent; background: transparent; color: #1677ff; }
    .ant-btn-text { border-color: transparent; background: transparent; }
    .ant-input { box-sizing: border-box; padding: 4px 11px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 14px; line-height: 22px; outline: none; }
    .ant-input:focus { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22,119,255,0.2); }
  </style>
</head>
<body>
  <div style="${containerStyle}">
${componentsHtml}
  </div>
</body>
</html>`;
};
