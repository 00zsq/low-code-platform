import React from 'react';
import { Modal, Button, Tabs, message } from 'antd';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  exportToReactCode,
  exportToHTML,
  exportToJSON,
} from '../../../utils/exporters';
import './ExportModal.css';

/**
 * 导出模态框组件属性接口
 */
interface ExportModalProps {
  /** 是否显示模态框 */
  open: boolean;
  /** 关闭模态框的回调函数 */
  onClose: () => void;
}

/**
 * 代码导出模态框组件
 * 支持将低代码设计导出为 React JSX、HTML、JSON 三种格式
 * 提供代码预览、复制到剪贴板、下载文件等功能
 */
const ExportModal: React.FC<ExportModalProps> = ({ open, onClose }) => {
  // 当前激活的标签页（react/html/json）
  const [activeTab, setActiveTab] = React.useState<string>('react');

  // 存储三种格式的导出代码
  const [codes, setCodes] = React.useState<{
    react: string;
    html: string;
    json: string;
  }>({
    react: '',
    html: '',
    json: '',
  });

  /**
   * 当模态框打开时，生成所有格式的导出代码
   * 使用 useEffect 确保每次打开都重新生成最新的代码
   */
  React.useEffect(() => {
    if (open) {
      try {
        // 调用导出工具函数生成三种格式的代码
        const reactCode = exportToReactCode(false); // 不直接下载，只获取代码
        const htmlCode = exportToHTML(false); // 不直接下载，只获取代码
        const jsonCode = exportToJSON(false); // 不直接下载，只获取代码

        setCodes({
          react: reactCode,
          html: htmlCode,
          json: jsonCode,
        });
      } catch (error) {
        console.error('生成代码失败:', error);
        message.error('生成代码失败，请检查组件配置');
      }
    }
  }, [open]);

  /**
   * 复制当前标签页的代码到剪贴板
   * 使用现代浏览器的 Clipboard API
   */
  const handleCopyCode = async () => {
    try {
      const currentCode = codes[activeTab as keyof typeof codes];
      await navigator.clipboard.writeText(currentCode);
      message.success('代码已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      message.error('复制失败，请手动选择复制');
    }
  };

  /**
   * 导出当前标签页的代码为文件
   * 根据不同的代码类型设置相应的文件名和 MIME 类型
   */
  const handleExportFile = () => {
    try {
      const currentCode = codes[activeTab as keyof typeof codes];
      let fileName = '';
      let mimeType = '';

      // 根据当前标签页确定文件格式
      switch (activeTab) {
        case 'react':
          fileName = 'GeneratedPage.jsx';
          mimeType = 'text/javascript';
          break;
        case 'html':
          fileName = 'GeneratedPage.html';
          mimeType = 'text/html';
          break;
        case 'json':
          fileName = 'CanvasData.json';
          mimeType = 'application/json';
          break;
        default:
          fileName = 'export.txt';
          mimeType = 'text/plain';
      }

      // 创建 Blob 对象并触发下载
      const blob = new Blob([currentCode], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // 清理内存

      message.success(`${fileName} 导出成功`);
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    }
  };

  const tabItems = [
    {
      key: 'react',
      label: 'React (JSX)',
      children: (
        <div className="code-container">
          <pre className="code-content">
            <code>{codes.react}</code>
          </pre>
        </div>
      ),
    },
    {
      key: 'html',
      label: 'HTML',
      children: (
        <div className="code-container">
          <pre className="code-content">
            <code>{codes.html}</code>
          </pre>
        </div>
      ),
    },
    {
      key: 'json',
      label: 'JSON',
      children: (
        <div className="code-container">
          <pre className="code-content">
            <code>{codes.json}</code>
          </pre>
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      title="导出预览"
      onCancel={onClose}
      width={800}
      style={{ top: 50 }}
      footer={[
        <Button key="copy" icon={<CopyOutlined />} onClick={handleCopyCode}>
          复制代码
        </Button>,
        <Button
          key="export"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExportFile}
        >
          导出文件
        </Button>,
      ]}
      destroyOnClose
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="small"
      />
    </Modal>
  );
};

export default ExportModal;
