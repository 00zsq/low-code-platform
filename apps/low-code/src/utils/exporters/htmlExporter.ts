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
    const { width, height } = (props || {}) as Record<string, unknown>;
    const style = serializeStyleForHtml({
      width: toStyleValue(width),
      height: toStyleValue(height),
      overflow: 'auto',
    });
    return `<div style="${style}"><table style="width: 100%; border-collapse: collapse; table-layout: fixed;"></table></div>`;
  }

  if (type === 'BarChart') {
    const { width, height } = (props || {}) as Record<string, unknown>;
    const style = serializeStyleForHtml({
      width: toStyleValue(width),
      height: toStyleValue(height),
      display: 'flex',
      alignItems: 'flex-end',
      gap: '8px',
      padding: '8px',
      border: '1px solid #eee',
      borderRadius: '6px',
      background: '#fff',
    });
    return `<div style="${style}"></div>`;
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
