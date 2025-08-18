import React from 'react';
import type { ComponentProps } from '../../../types/editor';

const CustomButtonRenderer: React.FC<{ props: ComponentProps }> = ({
  props,
}) => {
  const {
    text = '按钮',
    buttonType = 'primary',
    size = 'medium',
    disabled = false,
    backgroundColor,
    textColor,
    borderColor,
    borderRadius = '6px',
    width = '80px',
    height = '32px',
    fontSize = '14px',
  } = props;

  // 预设主题样式
  const getThemeStyles = () => {
    switch (buttonType) {
      case 'primary':
        return {
          backgroundColor: backgroundColor || '#1677ff',
          color: textColor || '#ffffff',
          border: `1px solid ${borderColor || '#1677ff'}`,
        };
      case 'secondary':
        return {
          backgroundColor: backgroundColor || '#ffffff',
          color: textColor || '#1677ff',
          border: `1px solid ${borderColor || '#d9d9d9'}`,
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

  // 尺寸样式
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: '2px 8px',
          fontSize: '12px',
          height: '24px',
        };
      case 'large':
        return {
          padding: '8px 16px',
          fontSize: '16px',
          height: '40px',
        };
      default: // medium
        return {
          padding: '4px 12px',
          fontSize: '14px',
          height: '32px',
        };
    }
  };

  const themeStyles = getThemeStyles();
  const sizeStyles = getSizeStyles();

  const buttonStyle: React.CSSProperties = {
    backgroundColor: themeStyles.backgroundColor as string,
    color: themeStyles.color as string,
    border: themeStyles.border,
    ...sizeStyles,
    width: width as string,
    height: height as string,
    fontSize: fontSize as string,
    borderRadius: borderRadius as string,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: 400,
    textAlign: 'center',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };

  return (
    <button
      style={buttonStyle}
      disabled={disabled as boolean}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.opacity = '0.8';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {text as string}
    </button>
  );
};

export default CustomButtonRenderer;
