import React from 'react';
import type { ComponentProps } from '../../../types/editor';

const CustomInputRenderer: React.FC<{ props: ComponentProps }> = ({
  props,
}) => {
  const {
    placeholder = '请输入',
    value = '',
    inputType = 'text',
    size = 'medium',
    disabled = false,
    width = '200px',
    borderRadius = '6px',
    borderColor = '#d9d9d9',
    backgroundColor = '#ffffff',
    textColor = '#000000',
  } = props;

  // 尺寸样式
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: '24px',
          padding: '2px 8px',
          fontSize: '12px',
        };
      case 'large':
        return {
          height: '40px',
          padding: '8px 16px',
          fontSize: '16px',
        };
      default: // medium
        return {
          height: '32px',
          padding: '4px 12px',
          fontSize: '14px',
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const inputStyle: React.CSSProperties = {
    width: width as string,
    color: textColor as string,
    backgroundColor: backgroundColor as string,
    border: `1px solid ${borderColor}`,
    borderRadius: borderRadius as string,
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxSizing: 'border-box',
    cursor: disabled ? 'not-allowed' : 'text',
    opacity: disabled ? 0.6 : 1,
    ...sizeStyles,
  };

  return (
    <input
      type={inputType as string}
      placeholder={placeholder as string}
      value={value as string}
      disabled={disabled as boolean}
      style={inputStyle}
      onFocus={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = '#1677ff';
          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(22, 119, 255, 0.2)';
        }
      }}
      onBlur={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = borderColor as string;
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      onChange={() => {
        // 在设计器中只是展示，不处理实际输入
      }}
    />
  );
};

export default CustomInputRenderer;
