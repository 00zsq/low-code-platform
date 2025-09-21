/**
 * 代码编辑器类型定义
 *
 * 定义了整个应用中使用的核心类型
 */

// 支持的编程语言模式
export type Language = 'json' | 'tsx';

// 设备屏幕方向
export type Orientation = 'portrait' | 'landscape';

// 主题模式
export type Theme = 'light' | 'dark';

// 低代码组件节点接口
export interface LowCodeNode {
  id: string; // 组件唯一标识符
  type: string; // 组件类型名称
  props?: Record<string, any>; // 组件属性配置
  children?: LowCodeNode[]; // 子组件列表（层级结构）
}

// 低代码页面模式接口
export interface LowCodeSchema {
  title?: string; // 页面标题
  version?: string; // 模式版本号
  components: LowCodeNode[]; // 页面中的组件列表
}

// 预览组件属性接口
export interface PreviewProps {
  language: Language; // 当前语言模式
  code: string; // 要预览的代码内容
  orientation: Orientation; // 设备屏幕方向
}
