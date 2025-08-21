import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { generateReactPreviewHtml } from '../../utils/htmlTemplate';

interface ReactPreviewProps {
  code: string;
}

// 防抖hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ReactPreview({ code }: ReactPreviewProps): React.ReactElement {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastCodeRef = useRef<string>('');
  
  // 使用防抖优化代码更新频率
  const debouncedCode = useDebounce(code, 300);

  // 生成iframe的HTML内容（只在首次加载时）
  const srcDoc = useMemo(() => {
    return generateReactPreviewHtml('');
  }, []);

  // 创建初始iframe
  useEffect(() => {
    if (!iframeRef.current || blobUrl) return;

    const blob = new Blob([srcDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    iframeRef.current.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [srcDoc]);

  // 监听iframe加载完成
  const handleIframeLoad = useCallback(() => {
    setIsLoaded(true);
    setError(null);
  }, []);

  // 代码更新处理
  const updateCode = useCallback((code: string) => {
    if (!isReady || !iframeRef.current?.contentWindow) return;
    
    try {
      // 使用新的消息格式
      iframeRef.current.contentWindow.postMessage({
        type: 'updateCode',
        code: code
      }, '*');
      
      setError(null);
      lastCodeRef.current = code;
    } catch (err) {
      console.error('Failed to update code:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [isReady]);

  // 代码更新监听
  useEffect(() => {
    if (debouncedCode !== lastCodeRef.current) {
      updateCode(debouncedCode);
    }
  }, [debouncedCode, updateCode]);

  // 消息处理
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      
      try {
        const { type, error } = event.data || {};
        
        if (type === 'iframeReady') {
          console.log('Iframe ready received');
          setIsReady(true);
          // iframe准备好后立即发送当前代码
          if (debouncedCode) {
            updateCode(debouncedCode);
          }
        } else if (type === 'error') {
          console.error('Preview error:', error);
          setError(error || '预览渲染失败');
        }
      } catch (err) {
        console.error('Message handling error:', err);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [debouncedCode, updateCode]);

  // 清理资源
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const showLoading = !isLoaded || !isReady;

  return (
    <div className="react-preview-container">
      {showLoading && (
        <div className="preview-loading">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <span>
              {!isLoaded ? '加载预览环境...' : '准备运行环境...'}
            </span>
          </div>
        </div>
      )}
      {error && (
        <div className="preview-error-overlay">
          <div className="error-content">
            <h4>预览错误</h4>
            <pre>{error}</pre>
            <button 
              onClick={() => {
                setError(null);
                setIsLoaded(false);
                setIsReady(false);
                if (blobUrl) {
                  URL.revokeObjectURL(blobUrl);
                  setBlobUrl(null);
                }
              }}
              className="retry-button"
            >
              重新加载
            </button>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="react-preview"
        onLoad={handleIframeLoad}
        sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-scripts"
        style={{
          border: '0',
          width: '100%',
          height: '100%',
          background: 'white',
          opacity: isLoaded && isReady && !error ? 1 : 0,
          transition: 'opacity 0.2s ease-in-out',
        }}
      />
    </div>
  );
} 