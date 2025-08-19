export type Language = 'json' | 'tsx';
export type Orientation = 'portrait' | 'landscape';
export type Theme = 'light' | 'dark';

export interface LowCodeNode {
  id: string;
  type: string;
  props?: Record<string, any>;
  children?: LowCodeNode[];
}

export interface LowCodeSchema {
  title?: string;
  version?: string;
  components: LowCodeNode[];
}

export interface PreviewProps {
  language: Language;
  code: string;
  orientation: Orientation;
} 