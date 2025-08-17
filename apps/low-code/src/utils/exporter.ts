import { useEditorStore } from '../store/editorStore';
import type { ComponentConfig, ComponentProps } from '../types/editor';
import {
  serializeStyleForJsx,
  serializeStyleForHtml,
  toStyleValue,
} from './styleSerialize';
import type { StyleLike } from './styleSerialize';

// 生成单个组件的 JSX 内容（不含定位包装）
const generateInnerJsx = (component: ComponentConfig) => {
  const { type, props } = component as ComponentConfig & {
    props: ComponentProps;
  };

  if (type === 'Text') {
    const { content, fontSize, color, textAlign } = props;
    return `<div style={{ fontSize: ${fontSize ?? 16}, color: '${
      color ?? '#000'
    }', textAlign: '${textAlign ?? 'left'}' }}>${content ?? ''}</div>`;
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
    const { width, height } = props;
    const container = serializeStyleForJsx({
      width: toStyleValue(width),
      height: toStyleValue(height),
      overflow: 'auto',
    });
    return `<div style={{ ${container} }}><table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      {/* 表头与数据在运行时渲染，此处保留容器与样式 */}
    </table></div>`;
  }

  if (type === 'BarChart') {
    const { width, height } = props;
    const c = serializeStyleForJsx({
      width: toStyleValue(width),
      height: toStyleValue(height),
      display: 'flex',
      alignItems: 'flex-end',
      gap: 8,
      padding: '8px',
      border: '1px solid #eee',
      borderRadius: 6,
      background: '#fff',
    });
    return `<div style={{ ${c} }}>{/* 柱状图导出为静态容器，数据运行时渲染 */}</div>`;
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
const wrapWithPositionJsx = (component: ComponentConfig, innerJsx: string) => {
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

// 导出为 React 代码（包含绝对定位）
export const exportToReactCode = () => {
  const { canvas } = useEditorStore.getState();

  let imports = `import React from 'react';\n`;
  const antdComponents = new Set<string>();
  canvas.components.forEach((component) => {
    if (component.type.startsWith('antd.')) {
      const componentName = component.type.split('.')[1];
      antdComponents.add(componentName);
    }
  });
  if (antdComponents.size > 0) {
    imports += `import { ${Array.from(antdComponents).join(
      ', '
    )} } from 'antd';\n`;
    imports += `import 'antd/dist/reset.css';\n`;
  }

  const childrenJsx = canvas.components
    .map((component) =>
      wrapWithPositionJsx(component, generateInnerJsx(component))
    )
    .join('\n');

  const containerStyle: StyleLike = {
    position: 'relative',
    width: canvas.style.width as number,
    height: canvas.style.height as number,
    backgroundColor: (canvas.style.backgroundColor as string) || '#ffffff',
    overflow: 'hidden',
  };
  const containerStyleLiteral = serializeStyleForJsx(containerStyle);

  const code = `${imports}
export default function GeneratedPage() {
  return (
    <div style={{ ${containerStyleLiteral} }}>
${childrenJsx}
    </div>
  );
}`;

  const blob = new Blob([code], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'GeneratedPage.jsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return code;
};

// 导出为 HTML（包含绝对定位）
export const exportToHTML = () => {
  const { canvas } = useEditorStore.getState();

  const generateComponentHtml = (component: ComponentConfig) => {
    const { type, props } = component as ComponentConfig & {
      props: ComponentProps;
    };

    if (type === 'Text') {
      const { content, fontSize, color, textAlign } = props || {};
      return `<div style="font-size: ${fontSize ?? 16}px; color: ${
        color ?? '#000'
      }; text-align: ${textAlign ?? 'left'};">${content ?? ''}</div>`;
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

  const componentsHtml = canvas.components
    .map((component) => {
      const style = serializeStyleForHtml({
        position: 'absolute',
        ...((component.style as StyleLike) || {}),
      });
      return `  <div style="${style}">
    ${generateComponentHtml(component)}
  </div>`;
    })
    .join('\n');

  const containerStyle = serializeStyleForHtml({
    position: 'relative',
    width: `${canvas.style.width}px` as unknown as string,
    height: `${canvas.style.height}px` as unknown as string,
    backgroundColor: (canvas.style.backgroundColor as string) || '#ffffff',
    overflow: 'hidden',
  });

  const html = `<!DOCTYPE html>
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

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'generated-page.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return html;
};

// 导出为 JSON（包含定位信息）
export const exportToJSON = () => {
  const { canvas } = useEditorStore.getState();
  const json = JSON.stringify(canvas, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'canvas.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return json;
};
