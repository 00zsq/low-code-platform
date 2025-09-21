/**
 * 预览组件 - 统一的预览入口
 *
 * 根据不同的语言模式选择对应的预览器：
 * - JSON模式：使用JsonPreview渲染低代码组件
 * - React模式：使用ReactPreview渲染JSX/TSX代码
 *
 * 所有预览内容都会被包裹在DeviceFrame中，模拟移动设备效果
 */
import React from 'react';
import type { PreviewProps } from '../../types';
import DeviceFrame from '../UI/DeviceFrame';
import ReactPreview from './ReactPreview';
import JsonPreview from './JsonPreview';

/**
 * 预览组件主函数
 * @param language 当前语言模式（json/tsx）
 * @param code 要预览的代码内容
 * @param orientation 设备方向（portrait/landscape）
 */
export default function Preview({
  language,
  code,
  orientation,
}: PreviewProps): React.ReactElement {
  return (
    <div className="preview-root">
      {/* 设备框架包裹器，模拟移动设备屏幕 */}
      <DeviceFrame orientation={orientation}>
        {/* 根据语言模式选择对应的预览器 */}
        {language === 'json' ? (
          <JsonPreview code={code} />
        ) : (
          <ReactPreview code={code} />
        )}
      </DeviceFrame>
    </div>
  );
}
