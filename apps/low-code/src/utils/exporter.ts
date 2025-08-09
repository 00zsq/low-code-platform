import { useEditorStore } from '../store/editorStore';
import type { ComponentConfig } from '../types/editor';

// 导出为React代码
export const exportToReactCode = () => {
  const { canvas } = useEditorStore.getState();

  // 收集导入语句
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
    imports += `import 'antd/dist/antd.css';\n`;
  }

  // 生成组件JSX
  const generateComponentJsx = (component: ComponentConfig) => {
    const { type, props } = component as ComponentConfig & { props: unknown };

    // 基础组件
    if (type === 'Text') {
      const { content, fontSize, color, textAlign } = props;
      return `<div style={{ fontSize: ${fontSize}, color: '${color}', textAlign: '${textAlign}' }}>${content}</div>`;
    }

    if (type === 'Image') {
      const { src, alt, width } = props;
      return `<img src="${src}" alt="${alt}" style={{ width: '${width}' }} />`;
    }

    // Ant Design组件
    if (type.startsWith('antd.')) {
      const componentName = type.split('.')[1];
      const propsString = Object.entries(props)
        .map(([key, value]) => {
          if (key === 'children') return '';
          if (typeof value === 'string') return `${key}="${value}"`;
          if (typeof value === 'boolean') return value ? `${key}` : '';
          return `${key}={${JSON.stringify(value)}}`;
        })
        .filter(Boolean)
        .join(' ');

      const children = props.children ? props.children : '';
      return `<${componentName} ${propsString}>${children}</${componentName}>`;
    }

    return `<div>未知组件: ${type}</div>`;
  };

  // 生成页面组件
  const pageJsx = canvas.components
    .map((component) => {
      return `  <div style={{ margin: '5px' }}>
    ${generateComponentJsx(component)}
  </div>`;
    })
    .join('\n');

  const code = `${imports}
export default function GeneratedPage() {
  return (
    <div style={{ 
      width: ${canvas.style.width},
      height: ${canvas.style.height},
      backgroundColor: '${canvas.style.backgroundColor || '#ffffff'}',
      padding: '20px',
    }}>
${pageJsx}
    </div>
  );
}`;

  // 下载代码文件
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

// 导出为HTML代码
export const exportToHTML = () => {
  const { canvas } = useEditorStore.getState();

  // 生成组件HTML
  const generateComponentHtml = (component: ComponentConfig) => {
    const { type, props } = component as ComponentConfig & { props: unknown };

    // 基础组件
    if (type === 'Text') {
      const { content, fontSize, color, textAlign } = props;
      return `<div style="font-size: ${fontSize}px; color: ${color}; text-align: ${textAlign};">${content}</div>`;
    }

    if (type === 'Image') {
      const { src, alt, width } = props;
      return `<img src="${src}" alt="${alt}" style="width: ${width};" />`;
    }

    // Ant Design组件 (简化处理)
    if (type.startsWith('antd.')) {
      const componentName = type.split('.')[1];
      if (componentName === 'Button') {
        const { children, type: btnType } = props;
        return `<button class="ant-btn ant-btn-${btnType || 'default'}">${
          children || 'Button'
        }</button>`;
      }
      if (componentName === 'Input') {
        const { placeholder } = props;
        return `<input type="text" class="ant-input" placeholder="${
          placeholder || ''
        }" />`;
      }
    }

    return `<div>未知组件: ${type}</div>`;
  };

  // 生成页面HTML
  const componentsHtml = canvas.components
    .map((component) => {
      return `  <div style="margin: 5px;">
    ${generateComponentHtml(component)}
  </div>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Page</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/4.16.13/antd.min.css" />
</head>
<body>
  <div style="
    width: ${canvas.style.width}px;
    height: ${canvas.style.height}px;
    background-color: ${canvas.style.backgroundColor || '#ffffff'};
    padding: 20px;
  ">
${componentsHtml}
  </div>
</body>
</html>`;

  // 下载HTML文件
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
