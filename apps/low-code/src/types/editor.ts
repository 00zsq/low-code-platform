export interface ComponentProps {
  [key: string]: unknown;
}

export interface ComponentConfig {
  id: string;
  type: string;
  name: string;
  props: ComponentProps;
  children?: ComponentConfig[];
  style?: React.CSSProperties;
}

export interface CanvasConfig {
  components: ComponentConfig[];
  style: React.CSSProperties;
}

export type ComponentType = 'container' | 'basic' | 'advanced' | 'antd';

export interface ComponentDefinition {
  type: string;
  name: string;
  category: ComponentType;
  defaultProps: ComponentProps;
  propConfig: PropConfig[];
}

export interface PropConfig {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | null;
  options?: { label: string; value: unknown }[];
  defaultValue?: unknown;
}