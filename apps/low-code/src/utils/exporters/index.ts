import { useEditorStore } from '../../store/editorStore';
import { serializeStyleForJsx, serializeStyleForHtml } from '../styleSerialize';
import type { StyleLike } from '../styleSerialize';

import { generateInnerJsx, wrapWithPositionJsx } from './jsxExporter';
import { generateComponentHtml, generateHtmlTemplate } from './htmlExporter';

// 导出为 React 代码（包含绝对定位）
export const exportToReactCode = (autoDownload: boolean = true) => {
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

  if (autoDownload) {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GeneratedPage.jsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return code;
};

// 导出为 HTML（包含绝对定位）
export const exportToHTML = (autoDownload: boolean = true) => {
  const { canvas } = useEditorStore.getState();

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

  const html = generateHtmlTemplate(componentsHtml, containerStyle);

  if (autoDownload) {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return html;
};

// 导出为 JSON（包含定位信息）
export const exportToJSON = (autoDownload: boolean = true) => {
  const { canvas } = useEditorStore.getState();
  const json = JSON.stringify(canvas, null, 2);

  if (autoDownload) {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return json;
};
