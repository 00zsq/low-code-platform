/**
 * JSON预览组件 - 低代码平台组件渲染器
 *
 * 该组件负责将低代码平台导出的JSON配置渲染成可视化的页面预览。
 * 核心功能包括：
 * 1. JSON解析和验证
 * 2. 低代码组件渲染引擎
 * 3. 响应式画布缩放
 * 4. 多种组件类型支持
 * 5. 样式100%还原
 */
import React, { useState, useEffect, useRef } from 'react';
import type { LowCodeSchema } from '../../types';

// JSON预览组件属性接口
interface JsonPreviewProps {
  code: string; // JSON格式的低代码配置字符串
}

/**
 * 低代码组件渲染器
 *
 * 这是核心的渲染引擎，负责：
 * 1. 解析低代码schema配置
 * 2. 动态计算画布缩放比例
 * 3. 渲染所有组件到正确位置
 * 4. 保持与低代码平台100%一致的视觉效果
 *
 * @param schema 低代码页面配置对象
 */
function LowCodeRenderer({
  schema,
}: {
  schema: LowCodeSchema;
}): React.ReactElement {
  const [scale, setScale] = useState(1); // 画布缩放比例
  const containerRef = useRef<HTMLDivElement>(null); // 容器DOM引用

  // 从schema中提取画布配置信息
  // 这些配置决定了最终渲染画布的尺寸和背景色
  const canvasWidth = (schema as any).style?.width || 1200; // 画布宽度，默认1200px
  const canvasHeight = (schema as any).style?.height || 740; // 画布高度，默认740px
  const canvasBackground = (schema as any).style?.backgroundColor || '#ffffff'; // 画布背景色

  /**
   * 响应式缩放算法
   *
   * 根据容器尺寸动态计算画布缩放比例，确保：
   * 1. 画布完整显示在容器内
   * 2. 保持原始宽高比
   * 3. 最大缩放比例不超过1（不放大）
   * 4. 响应窗口大小变化
   */
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        // 计算可用空间，减去容器的padding和边框
        const availableWidth = containerRect.width - 22; // 10px padding + 1px border * 2
        const availableHeight = containerRect.height - 22;

        if (availableWidth > 0 && availableHeight > 0) {
          // 分别计算水平和垂直方向的缩放比例
          const scaleX = availableWidth / canvasWidth;
          const scaleY = availableHeight / canvasHeight;
          // 取较小值确保画布完整显示，且不超过原始大小
          const newScale = Math.min(scaleX, scaleY, 1);

          setScale(newScale);
        }
      }
    };

    // 延迟执行，确保DOM完全渲染后再计算尺寸
    const timer = setTimeout(updateScale, 100);

    // 监听窗口大小变化，实现响应式缩放
    window.addEventListener('resize', updateScale);

    // 清理定时器和事件监听器
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScale);
    };
  }, [canvasWidth, canvasHeight]); // 依赖画布尺寸，尺寸变化时重新计算

  // 计算缩放后的实际显示尺寸
  // 这些尺寸用于设置外层容器的大小
  const scaledWidth = canvasWidth * scale;
  const scaledHeight = canvasHeight * scale;

  // 画布容器样式配置
  // 使用CSS transform进行缩放，保持内部组件的原始尺寸和定位
  const canvasStyle: React.CSSProperties = {
    position: 'relative', // 相对定位，作为绝对定位组件的参考
    width: `${canvasWidth}px`, // 保持原始宽度
    height: `${canvasHeight}px`, // 保持原始高度
    backgroundColor: canvasBackground, // 应用背景色
    transformOrigin: 'top left', // 缩放原点设为左上角
    transform: `scale(${scale})`, // 应用缩放变换
  };

  /**
   * 组件内容渲染引擎
   *
   * 根据组件类型渲染对应的React元素，支持的组件类型包括：
   * - Text: 文本组件（支持多种HTML标签）
   * - CustomButton: 自定义按钮（支持多种主题样式）
   * - CustomInput: 自定义输入框
   * - Image: 图片组件
   * - Div: 容器组件
   * - FlexContainer: 弹性布局容器
   * - CustomTable: 自定义表格
   * - BarChart: 柱状图组件
   *
   * @param component 组件配置对象，包含type和props
   * @returns 渲染后的React节点
   */
  const renderComponentContent = (component: any): React.ReactNode => {
    const { type, props = {} } = component;

    switch (type) {
      case 'Text': {
        // 文本组件：支持多种HTML标签类型和样式配置
        const { content, fontSize, color, textAlign, type: textType } = props;
        const style: React.CSSProperties = {
          fontSize: fontSize || 16, // 字体大小，默认16px
          color: color || '#000000', // 文字颜色，默认黑色
          textAlign: textAlign || 'left', // 文本对齐方式
          margin: 0, // 清除默认边距
          padding: 0, // 清除默认内边距
        };

        // 根据文本类型选择对应的HTML标签
        // 这样可以保持语义化的HTML结构
        switch (textType) {
          case 'h1':
            return <h1 style={style}>{content || '标题1'}</h1>;
          case 'h2':
            return <h2 style={style}>{content || '标题2'}</h2>;
          case 'h3':
            return <h3 style={style}>{content || '标题3'}</h3>;
          case 'p':
            return <p style={style}>{content || '段落'}</p>;
          case 'strong':
            return <strong style={style}>{content || '粗体文本'}</strong>;
          case 'em':
            return <em style={style}>{content || '斜体文本'}</em>;
          default:
            return <span style={style}>{content || '文本'}</span>;
        }
      }

      case 'CustomButton': {
        // 自定义按钮组件：支持多种主题样式和自定义配置
        const {
          text = '按钮', // 按钮文本
          buttonType = 'primary', // 按钮类型（主题）
          disabled = false, // 是否禁用
          backgroundColor, // 自定义背景色
          textColor, // 自定义文字色
          borderColor, // 自定义边框色
          borderRadius = '6px', // 圆角大小
          fontSize = '14px', // 字体大小
        } = props;

        // 根据按钮类型获取预设的主题样式
        // 支持primary、danger、success、warning、ghost等类型
        const getThemeStyles = () => {
          switch (buttonType) {
            case 'primary':
              return {
                backgroundColor: backgroundColor || '#1677ff',
                color: textColor || '#ffffff',
                border: `1px solid ${borderColor || '#1677ff'}`,
              };
            case 'danger':
              return {
                backgroundColor: backgroundColor || '#ff4d4f',
                color: textColor || '#ffffff',
                border: `1px solid ${borderColor || '#ff4d4f'}`,
              };
            case 'success':
              return {
                backgroundColor: backgroundColor || '#52c41a',
                color: textColor || '#ffffff',
                border: `1px solid ${borderColor || '#52c41a'}`,
              };
            case 'warning':
              return {
                backgroundColor: backgroundColor || '#faad14',
                color: textColor || '#ffffff',
                border: `1px solid ${borderColor || '#faad14'}`,
              };
            case 'ghost':
              return {
                backgroundColor: 'transparent',
                color: textColor || '#1677ff',
                border: `1px solid ${borderColor || '#1677ff'}`,
              };
            default:
              return {
                backgroundColor: backgroundColor || '#ffffff',
                color: textColor || '#000000',
                border: `1px solid ${borderColor || '#d9d9d9'}`,
              };
          }
        };

        const themeStyles = getThemeStyles();
        // 按钮完整样式配置，确保与低代码平台样式一致
        const buttonStyle: React.CSSProperties = {
          width: '100%', // 填满容器宽度
          height: '100%', // 填满容器高度
          fontSize: fontSize,
          borderRadius: borderRadius,
          cursor: disabled ? 'not-allowed' : 'pointer', // 禁用状态显示禁用光标
          opacity: disabled ? 0.6 : 1, // 禁用状态透明度
          outline: 'none', // 移除默认焦点轮廓
          padding: '4px 12px', // 内边距
          display: 'inline-flex', // 弹性布局
          alignItems: 'center', // 垂直居中
          justifyContent: 'center', // 水平居中
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', // 系统字体
          transition: 'all 0.2s ease', // 平滑过渡动画
          boxSizing: 'border-box', // 边框盒模型
          whiteSpace: 'nowrap', // 文本不换行
          userSelect: 'none', // 禁止文本选择
          ...themeStyles, // 应用主题样式
        };

        return (
          <button style={buttonStyle} disabled={disabled}>
            {text}
          </button>
        );
      }

      case 'CustomInput': {
        // 自定义输入框组件：支持多种输入类型和样式配置
        const {
          placeholder = '请输入', // 占位符文本
          value = '', // 默认值
          inputType = 'text', // 输入类型（text、password、email等）
          disabled = false, // 是否禁用
          borderRadius = '6px', // 圆角大小
          borderColor = '#d9d9d9', // 边框颜色
          backgroundColor = '#ffffff', // 背景色
          textColor = '#000000', // 文字颜色
          fontSize = '14px', // 字体大小
        } = props;

        // 输入框样式配置，保持与低代码平台一致
        const inputStyle: React.CSSProperties = {
          width: '100%', // 填满容器宽度
          height: '100%', // 填满容器高度
          padding: '4px 12px', // 内边距
          fontSize: fontSize,
          color: textColor,
          backgroundColor: backgroundColor,
          border: `1px solid ${borderColor}`, // 边框样式
          borderRadius: borderRadius,
          outline: 'none', // 移除默认焦点轮廓
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          cursor: disabled ? 'not-allowed' : 'text', // 光标样式
          opacity: disabled ? 0.6 : 1, // 禁用状态透明度
          boxSizing: 'border-box', // 边框盒模型
        };

        return (
          <input
            type={inputType}
            placeholder={placeholder}
            defaultValue={value}
            disabled={disabled}
            style={inputStyle}
          />
        );
      }

      case 'Image': {
        const { src, alt, width } = props;
        return (
          <img
            src={
              src ||
              'https://via.placeholder.com/150x100/e5e7eb/6b7280?text=Image'
            }
            alt={alt || '图片'}
            style={{
              width: width || '150px',
              height: 'auto',
              display: 'block',
            }}
          />
        );
      }

      case 'Div': {
        const { content, backgroundColor, padding, borderRadius } = props;
        const divStyle: React.CSSProperties = {
          backgroundColor: backgroundColor || '#fafafa',
          padding: padding || '12px',
          borderRadius: borderRadius || '6px',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
        };
        return <div style={divStyle}>{content || '容器内容'}</div>;
      }

      case 'FlexContainer': {
        const {
          direction = 'row',
          justifyContent = 'flex-start',
          alignItems = 'center',
          gap = '8px',
          padding = '8px',
          backgroundColor = '#fff',
          minHeight = '80px',
        } = props;

        const flexStyle: React.CSSProperties = {
          display: 'flex',
          flexDirection: direction as any,
          justifyContent: justifyContent as any,
          alignItems: alignItems as any,
          gap: gap,
          padding: padding,
          backgroundColor: backgroundColor,
          minHeight: minHeight,
          width: '100%',
          height: '100%',
          border: '2px dashed #ccc',
          borderRadius: '4px',
          boxSizing: 'border-box',
        };

        return (
          <div style={flexStyle}>
            <div style={{ color: '#999', fontSize: 12 }}>
              Flex容器 - 可拖入其他组件
            </div>
          </div>
        );
      }

      case 'CustomTable': {
        // 自定义表格组件：支持动态列配置和数据渲染
        const { bordered, columnsJson, dataJson } = props;

        // 解析JSON格式的表格配置
        // 列配置格式：[{title: '列名', dataIndex: '字段名'}]
        let columns: Array<{ title: string; dataIndex: string }> = [];
        // 数据格式：[{字段名: 值}]
        let data: Array<Record<string, unknown>> = [];

        // 安全解析JSON，避免解析错误导致组件崩溃
        try {
          columns = JSON.parse(columnsJson || '[]');
        } catch {} // 解析失败时使用空数组

        try {
          data = JSON.parse(dataJson || '[]');
        } catch {} // 解析失败时使用空数组

        const tableStyle: React.CSSProperties = {
          width: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
        };

        const cellStyle: React.CSSProperties = {
          border: bordered ? '1px solid #d9d9d9' : 'none',
          padding: '6px 8px',
          fontSize: '12px',
        };

        const wrapStyle: React.CSSProperties = {
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'stretch',
        };

        return (
          <div style={wrapStyle}>
            <table style={tableStyle}>
              {columns.length > 0 && (
                <thead>
                  <tr>
                    {columns.map((c, idx) => (
                      <th
                        key={idx}
                        style={{
                          ...cellStyle,
                          background: '#fafafa',
                          textAlign: 'left',
                        }}
                      >
                        {c.title}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              {data.length > 0 && (
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx}>
                      {columns.map((c, colIdx) => (
                        <td key={colIdx} style={cellStyle}>
                          {String(row[c.dataIndex] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        );
      }

      case 'BarChart': {
        // 柱状图组件：简单的数据可视化图表
        const { barColor, dataJson } = props;

        // 解析图表数据，格式：[{label: '标签', value: 数值}]
        let data: Array<{ label: string; value: number }> = [];
        try {
          data = JSON.parse(dataJson || '[]');
        } catch {} // 解析失败时使用空数组

        // 计算数据最大值，用于柱子高度比例计算
        const maxValue = Math.max(1, ...data.map((d) => Number(d.value) || 0));

        // 图表布局计算 - 使用固定参考尺寸确保一致性
        const referenceWidth = 400; // 参考宽度
        const referenceHeight = 200; // 参考高度
        const gap = 8; // 柱子间距
        const innerPadding = 8; // 内边距
        const count = Math.max(1, data.length); // 柱子数量
        const availableWidth = Math.max(
          0,
          referenceWidth - innerPadding * 2 - gap * (count - 1)
        );
        const barWidth = Math.max(16, Math.floor(availableWidth / count)); // 单个柱子宽度

        const containerStyle: React.CSSProperties = {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          padding: '8px',
          border: '1px solid #eee',
          borderRadius: '6px',
          background: '#fff',
          overflow: 'hidden',
          boxSizing: 'border-box',
        };

        return (
          <div style={containerStyle}>
            {data.map((d, idx) => {
              // 根据数值比例计算柱子高度
              const h =
                (Number(d.value) / maxValue) *
                Math.max(0, referenceHeight - innerPadding * 2 - 24);

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column', // 垂直布局：柱子在上，标签在下
                    alignItems: 'center', // 水平居中
                  }}
                >
                  {/* 柱子部分 */}
                  <div
                    style={{
                      width: `${barWidth}px`,
                      height: `${Math.max(2, h)}px`, // 最小高度2px
                      background: barColor || '#1677ff', // 柱子颜色
                      borderRadius: '4px', // 圆角
                    }}
                  />
                  {/* 标签部分 */}
                  <div
                    style={{
                      fontSize: '12px',
                      textAlign: 'center',
                      marginTop: '4px',
                    }}
                  >
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      default:
        // 未知组件类型的错误提示
        // 当遇到不支持的组件类型时显示友好的错误信息
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ff4d4f', // 红色边框表示错误
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 77, 79, 0.1)', // 淡红色背景
              color: '#ff4d4f', // 红色文字
              fontSize: '12px',
            }}
          >
            未知组件: {type}
          </div>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        overflow: 'hidden',
        padding: '10px',
        boxSizing: 'border-box',
        minHeight: '200px',
      }}
    >
      {/* 画布容器 */}
      <div
        style={{
          position: 'relative',
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          border: '1px solid #d9d9d9',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          backgroundColor: canvasBackground,
          flexShrink: 0,
        }}
      >
        <div style={canvasStyle}>
          {/* 渲染所有组件 */}
          {schema.components?.map((component) => {
            // 为每个组件创建定位容器
            // 使用绝对定位精确控制组件位置和尺寸
            const containerStyle: React.CSSProperties = {
              position: 'absolute', // 绝对定位
              left: (component as any).style?.left || '0px', // X坐标
              top: (component as any).style?.top || '0px', // Y坐标
              width: (component as any).style?.width || 'auto', // 宽度
              height: (component as any).style?.height || 'auto', // 高度
            };

            return (
              <div key={component.id} style={containerStyle}>
                {/* 渲染组件内容 */}
                {renderComponentContent(component)}
              </div>
            );
          }) || (
            // 当没有组件时显示提示信息
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)', // 居中显示
                textAlign: 'center',
                color: '#999',
                fontSize: '16px',
              }}
            >
              没有找到组件
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * JSON预览主组件
 *
 * 处理JSON代码的解析和渲染：
 * 1. 解析JSON字符串
 * 2. 验证是否为有效的低代码schema
 * 3. 渲染对应的预览内容
 * 4. 处理解析错误和异常情况
 *
 * @param code JSON格式的代码字符串
 */
export default function JsonPreview({
  code,
}: JsonPreviewProps): React.ReactElement {
  try {
    // 尝试解析JSON代码
    const data = JSON.parse(code);

    // 检查是否为有效的低代码schema（必须包含components数组）
    if (data && Array.isArray(data.components)) {
      return <LowCodeRenderer schema={data} />;
    }

    // 如果不是标准schema，展示格式化的原始JSON
    return (
      <div
        style={{
          background: 'var(--bg)',
          color: 'var(--text)',
          height: '100%',
          overflow: 'auto',
          padding: '20px',
        }}
      >
        <div
          style={{
            marginBottom: 16,
            fontSize: 12,
            color: 'var(--text-muted)',
            padding: '8px 12px',
            background: 'var(--panel)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>📄</span>
          原始 JSON 数据
        </div>
        <pre
          style={{
            padding: 20,
            margin: 0,
            fontSize: 12,
            lineHeight: 1.6,
            background: 'var(--panel)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            fontFamily:
              "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
            overflow: 'auto',
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  } catch (e) {
    return (
      <div
        style={{
          background: 'var(--bg)',
          color: 'var(--text)',
          height: '100%',
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            border: '2px dashed var(--error)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            maxWidth: '400px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '8px',
              color: 'var(--error)',
            }}
          >
            JSON 解析错误
          </div>
          <pre
            style={{
              color: 'var(--error)',
              fontSize: 12,
              backgroundColor: 'var(--panel)',
              padding: '12px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--error)',
              fontFamily: "'JetBrains Mono', monospace",
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {String(e)}
          </pre>
        </div>
      </div>
    );
  }
}
