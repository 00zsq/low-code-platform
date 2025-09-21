/**
 * React代码预览组件
 * 
 * 该组件负责在安全的iframe环境中执行和预览React/JSX/TSX代码。
 * 核心功能包括：
 * 1. iframe沙箱隔离执行
 * 2. 实时热更新
 * 3. 错误捕获和显示
 * 4. 防抖优化
 * 5. 资源管理
 */
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { generateReactPreviewHtml } from '../../utils/htmlTemplate';

// React预览组件属性接口
interface ReactPreviewProps {
  code: string; // 要预览的React/JSX/TSX代码
}

/**
 * 防抖Hook
 * 
 * 用于减少高频率更新对性能的影响。
 * 当用户快速输入代码时，只有在停止输入一段时间后才触发预览更新。
 * 
 * @param value 需要防抖的值
 * @param delay 防抖延迟时间（毫秒）
 * @returns 防抖后的值
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 设置延迟定时器
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理上一次的定时器
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * React预览主组件
 * 
 * 使用iframe沙箱模式安全执行React代码，实现：
 * 1. 代码安全执行（防止影响主应用）
 * 2. 实时热更新（代码变更立即生效）
 * 3. 错误隔离和显示
 * 4. 资源管理和清理
 */
export default function ReactPreview({ code }: ReactPreviewProps): React.ReactElement {
  // iframe DOM引用
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  
  // 组件状态管理
  const [isLoaded, setIsLoaded] = useState(false); // iframe是否加载完成
  const [isReady, setIsReady] = useState(false); // iframe内部环境是否就绪
  const [blobUrl, setBlobUrl] = useState<string | null>(null); // Blob URL缓存
  const [error, setError] = useState<string | null>(null); // 错误信息
  const lastCodeRef = useRef<string>(''); // 上次执行的代码（用于去重）
  
  // 使用防抖优化代码更新频率
  // 300ms延迟可以在用户输入时减少不必要的更新
  const debouncedCode = useDebounce(code, 300);

  // 生成iframe的HTML模板（只生成一次，提高性能）
  // 初始不传入代码，后续通过postMessage动态更新
  const srcDoc = useMemo(() => {
    return generateReactPreviewHtml(''); // 空字符串表示初始无代码
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