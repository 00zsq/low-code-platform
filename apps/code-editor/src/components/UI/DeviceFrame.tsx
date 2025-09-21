/**
 * 设备框架组件
 *
 * 模拟移动设备的屏幕框架，支持：
 * - 竖屏模式（390x844）
 * - 横屏模式（844x390）
 * - 平滑的尺寸切换动画
 * - 响应式缩放适配
 */
import React from 'react';
import type { Orientation } from '../../types';

// 设备框架组件属性接口
interface DeviceFrameProps {
  orientation: Orientation; // 设备方向
  children: React.ReactNode; // 要在设备屏幕中显示的内容
}

/**
 * 设备框架主组件
 * @param orientation 设备方向（竖屏/横屏）
 * @param children 要在设备屏幕中显示的内容
 */
export default function DeviceFrame({
  orientation,
  children,
}: DeviceFrameProps): React.ReactElement {
  // 根据方向计算设备尺寸（模拟Phone 12 Pro尺寸）
  const size =
    orientation === 'portrait'
      ? { width: 390, height: 844 } // 竖屏尺寸
      : { width: 844, height: 390 }; // 横屏尺寸

  return (
    <div
      className={`device-frame ${orientation}`}
      style={{
        // 外框尺寸（含24px边框）
        width: size.width + 24,
        height: size.height + 24,
        transition: 'all 0.3s ease-in-out', // 平滑的尺寸切换动画
      }}
    >
      <div
        className="device-screen"
        style={{
          // 实际屏幕尺寸
          width: size.width,
          height: size.height,
          transition: 'all 0.3s ease-in-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
