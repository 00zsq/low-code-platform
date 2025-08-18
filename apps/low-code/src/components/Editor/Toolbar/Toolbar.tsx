import React from 'react';
import { Button, InputNumber } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import ExportModal from '../ExportModal/ExportModal';
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

  const [exportModalOpen, setExportModalOpen] = React.useState(false);

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
          icon={<ExportOutlined />}
          className={styles.button}
          onClick={() => setExportModalOpen(true)}
        >
          导出代码
        </Button>
        <Button className={styles.button} onClick={clearCanvas}>
          清空
        </Button>
      </div>

      {/* 导出预览弹窗 */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
};

export default Toolbar;
