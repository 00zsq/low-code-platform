import React, { useEffect, useRef, useState } from 'react';

function GeneratedPage() {
  return (
    <div style={{ position: 'relative', width: 1200, height: 740, backgroundColor: '#ffffff', overflow: 'hidden' }}>
  <div style={{ position: 'absolute', left: '326px', top: '140.8984375px', width: 'auto', height: 'auto' }}>
    <span style={{ fontSize: 16, color: '#000000', textAlign: 'left' }}>示例文本</span>
  </div>
  <div style={{ position: 'absolute', left: '324px', top: '316.8984375px', width: '200px', height: '100px' }}>
    <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '6px', width: '200px', height: '100px' }}>容器内容</div>
  </div>
  <div style={{ position: 'absolute', left: '725px', top: '217.8984375px', width: '300px', height: '150px' }}>
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#fff', minHeight: '80px', width: '300px', height: '150px', border: '2px dashed #ccc', borderRadius: '4px' }}><div style={{ color: '#999', fontSize: 12 }}>Flex容器 - 可拖入其他组件</div></div>
  </div>
  <div style={{ position: 'absolute', left: '151px', top: '375.8984375px', width: '150px', height: 'auto' }}>
    <img src="https://gitlab.codemao.cn/uploads/-/system/user/avatar/821/avatar.png?width=23" alt="示例图片" style={{ width: '150px' }} />
  </div>
  <div style={{ position: 'absolute', left: '595px', top: '502.8984375px', width: '200px', height: '32px' }}>
    <input type="text" placeholder="请输入" defaultValue="" disabled={false} style={{ width: '200px', height: '32px', padding: '4px 12px', fontSize: '14px', color: '#000000', backgroundColor: '#ffffff', border: '1px solid #d9d9d9', borderRadius: '6px', outline: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', cursor: 'text', opacity: 1 }} />
  </div>
    </div>
  );
}

const PreviewPage: React.FC = () => {
  const [scale, setScale] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 740 });
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 获取GeneratedPage的实际尺寸
    if (contentRef.current) {
      const firstChild = contentRef.current.firstElementChild as HTMLElement;
      if (firstChild) {
        const computedStyle = window.getComputedStyle(firstChild);
        const width = parseInt(computedStyle.width) || 1200;
        const height = parseInt(computedStyle.height) || 740;
        setCanvasSize({ width, height });
      }
    }

    // 计算缩放比例
    const updateScale = () => {
      const viewportWidth = window.innerWidth - 40;
      const viewportHeight = window.innerHeight - 40;
      
      const scaleX = viewportWidth / canvasSize.width;
      const scaleY = viewportHeight / canvasSize.height;
      const newScale = Math.min(scaleX, scaleY, 1); // 最大不超过1
      
      setScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [canvasSize.width, canvasSize.height]);

  // 缩放后的实际显示尺寸
  const scaledWidth = canvasSize.width * scale;
  const scaledHeight = canvasSize.height * scale;

  return (
    <div style={{ 
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      overflow: 'hidden',
    }}>
      {/* 缩放容器 */}
      <div style={{
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        border: '1px solid #d9d9d9',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        <div 
          ref={contentRef}
          style={{
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
          }}
        >
          <GeneratedPage />
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;