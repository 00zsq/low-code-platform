import React from 'react';
import { Button, InputNumber } from 'antd';
import {
  exportToReactCode,
  exportToHTML,
  exportToJSON,
} from '../../../utils/exporter';
import styles from './Toolbar.module.css';
import { useEditorStore } from '../../../store/editorStore';

const Toolbar: React.FC = () => {
  const {
    canvas,
    updateCanvasStyle,
    canvasScale,
    setCanvasScale,
    clearCanvas,
  } = useEditorStore();

  return (
    <div className={styles.main}>
      <div className={styles.leftGroup}>
        {/* 画布尺寸设置 */}
        <span className={styles.label}>宽度:</span>
        <InputNumber
          size="small"
          min={100}
          value={canvas.style.width as number}
          onChange={(value) => updateCanvasStyle({ width: Number(value) })}
          className={styles.sizeInput}
        />
        <span className={styles.label}>px</span>
        <span className={styles.label}>高度:</span>
        <InputNumber
          size="small"
          min={100}
          value={canvas.style.height as number}
          onChange={(value) => updateCanvasStyle({ height: Number(value) })}
          className={styles.sizeInput}
        />
        <span className={styles.label}>px</span>
        {/* 缩放 */}
        <span className={styles.label}>缩放:</span>
        {[0.5, 0.75, 1, 1.25, 1.5].map((scale) => (
          <Button
            key={scale}
            size="small"
            type={canvasScale === scale ? 'primary' : 'default'}
            onClick={() => setCanvasScale(scale)}
            className={styles.scaleButton}
          >
            {Math.round(scale * 100)}%
          </Button>
        ))}
      </div>
      <div className={styles.rightGroup}>
        <Button
          type="primary"
          className={styles.reactButton + ' ' + styles.button}
          onClick={exportToReactCode}
        >
          导出React
        </Button>
        <Button
          type="default"
          className={styles.htmlButton + ' ' + styles.button}
          onClick={exportToHTML}
        >
          导出HTML
        </Button>
        <Button className={styles.button} onClick={exportToJSON}>
          导出JSON
        </Button>
        <Button className={styles.button} onClick={clearCanvas}>
          清空
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
