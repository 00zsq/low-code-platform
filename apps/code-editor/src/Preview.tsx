import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface PreviewProps {
  language: 'json' | 'tsx';
  code: string;
  orientation: 'portrait' | 'landscape';
}

function DeviceFrame(props: {
  orientation: 'portrait' | 'landscape';
  children: React.ReactNode;
}): React.ReactElement {
  const { orientation, children } = props;
  const size =
    orientation === 'portrait'
      ? { width: 390, height: 844 }
      : { width: 844, height: 390 };

  return (
    <div
      className="device-frame"
      style={{ width: size.width + 20, height: size.height + 20 }}
    >
      <div className="device-notch" />
      <div
        className="device-screen"
        style={{ width: size.width, height: size.height }}
      >
        {children}
      </div>
    </div>
  );
}

// 简单低代码渲染器：支持 Text / Button / Container / Image
type LowNode = {
  id: string;
  type: string;
  props?: Record<string, any>;
  children?: LowNode[];
};

function safeEvalFunction(
  code: string | undefined
): ((...args: any[]) => any) | undefined {
  if (!code || typeof code !== 'string') return undefined;
  try {
    // 仅创建函数体，形参为 event, state, setState, console
    // eslint-disable-next-line no-new-func
    const fn = new Function('event', 'state', 'setState', 'console', code);
    return (event: any, state: any, setState: any) =>
      fn(event, state, setState, console);
  } catch (e) {
    // 安全失败兜底
    return undefined;
  }
}

function LowRenderer({
  schema,
}: {
  schema: { components: LowNode[] };
}): React.ReactElement {
  const [state, setState] = useState<Record<string, any>>({});

  const renderNode = (node: LowNode): React.ReactNode => {
    const { type, props = {}, children = [] } = node;
    const commonProps: any = {};
    if (props.style && typeof props.style === 'object')
      commonProps.style = props.style;
    if (props.className) commonProps.className = props.className;

    switch (type) {
      case 'Text':
        return <span {...commonProps}>{props.children ?? ''}</span>;
      case 'Heading':
        return <h3 {...commonProps}>{props.text ?? props.children ?? ''}</h3>;
      case 'Button': {
        const onClick = safeEvalFunction(props.onClick);
        return (
          <button
            {...commonProps}
            onClick={(e) => onClick?.(e, state, setState)}
          >
            {props.text ?? '按钮'}
          </button>
        );
      }
      case 'Image':
        return <img {...commonProps} src={props.src} alt={props.alt ?? ''} />;
      case 'Container':
      case 'View':
        return (
          <div {...commonProps}>
            {children.map((child) => (
              <React.Fragment key={child.id}>
                {renderNode(child)}
              </React.Fragment>
            ))}
          </div>
        );
      default:
        return (
          <div {...commonProps}>
            <small style={{ color: '#999' }}>未知组件：{type}</small>
          </div>
        );
    }
  };

  return (
    <div style={{ padding: 12 }}>
      {schema.components.map((node) => (
        <React.Fragment key={node.id}>{renderNode(node)}</React.Fragment>
      ))}
    </div>
  );
}

export default function Preview(props: PreviewProps): React.ReactElement {
  const { language, code, orientation } = props;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const srcDoc = useMemo(() => {
    if (language === 'json') return '';

    const safeCode = code.replace(/<\/?script>/gi, (m) =>
      m.replace('script', 'scr"+"ipt')
    );

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body, #root { height: 100%; margin: 0; }
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, PingFang SC, Microsoft YaHei, sans-serif; }
      * { box-sizing: border-box; }
      .error { color: #f44336; white-space: pre-wrap; padding: 12px; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone@7.25.0/babel.min.js"></script>
    <script type="text/babel" data-presets="typescript,react">
      try {
        ${safeCode}
        const Root = (typeof App !== 'undefined') ? App : null;
        const root = ReactDOM.createRoot(document.getElementById('root'));
        if (Root) {
          root.render(React.createElement(Root));
        } else {
          root.render(React.createElement('div', null, '未检测到 App 组件，请定义 function App() { ... }'));
        }
      } catch (err) {
        document.body.innerHTML = '<pre class="error">' + (err && err.stack ? err.stack : String(err)) + '</pre>'
        console.error(err)
      }
    </script>
  </body>
</html>`;
    return html;
  }, [language, code]);

  useEffect(() => {
    if (!iframeRef.current || language === 'json') return;

    const blob = new Blob([srcDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    iframeRef.current.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [srcDoc, language]);

  // 小防抖：在语言切换或快速编辑中避免过度刷新
  useEffect(() => {
    let timer: number | undefined;
    if (language !== 'json') {
      timer = window.setTimeout(() => {
        if (iframeRef.current && blobUrl) {
          iframeRef.current.src = blobUrl;
        }
      }, 160);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [blobUrl, language]);

  return (
    <div className="preview-root">
      <DeviceFrame orientation={orientation}>
        {language === 'json' ? (
          <div
            className="json-preview"
            style={{ background: '#fff', color: '#000' }}
          >
            {(() => {
              try {
                const data = JSON.parse(code);
                if (data && Array.isArray(data.components)) {
                  return <LowRenderer schema={data} />;
                }
                // 向下兼容：如果不是标准 schema，就展示原始 JSON
                return (
                  <pre className="json-pre">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                );
              } catch (e) {
                return (
                  <pre className="json-error">无效的 JSON：{String(e)}</pre>
                );
              }
            })()}
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            title="react-preview"
            sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-scripts"
            style={{
              border: '0',
              width: '100%',
              height: '100%',
              background: 'white',
            }}
          />
        )}
      </DeviceFrame>
    </div>
  );
}
