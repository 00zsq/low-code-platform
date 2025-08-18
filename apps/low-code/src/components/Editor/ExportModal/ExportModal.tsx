import React from 'react';
import { Modal, Button, Tabs, message } from 'antd';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  exportToReactCode,
  exportToHTML,
  exportToJSON,
} from '../../../utils/exporters';
import './ExportModal.css';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<string>('react');
  const [codes, setCodes] = React.useState<{
    react: string;
    html: string;
    json: string;
  }>({
    react: '',
    html: '',
    json: '',
  });

  // 生成所有格式的代码
  React.useEffect(() => {
    if (open) {
      try {
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

  // 复制代码到剪贴板
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

  // 导出文件
  const handleExportFile = () => {
    try {
      const currentCode = codes[activeTab as keyof typeof codes];
      let fileName = '';
      let mimeType = '';

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

      const blob = new Blob([currentCode], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

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
