import type { ComponentDefinition } from '../../types/editor';

const antdMaterials: ComponentDefinition[] = [
  {
    type: 'antd.Button',
    name: '按钮',
    category: 'antd',
    defaultProps: {
      children: '按钮',
      type: 'primary',
      size: 'middle',
    },
    propConfig: [
      {
        name: 'children',
        label: '文本',
        type: 'string',
      },
      {
        name: 'type',
        label: '类型',
        type: 'select',
        options: [
          { label: '主按钮', value: 'primary' },
          { label: '默认按钮', value: 'default' },
          { label: '虚线按钮', value: 'dashed' },
          { label: '链接按钮', value: 'link' },
          { label: '文本按钮', value: 'text' },
        ],
        defaultValue: 'primary',
      },
      {
        name: 'size',
        label: '大小',
        type: 'select',
        options: [
          { label: '大', value: 'large' },
          { label: '中', value: 'middle' },
          { label: '小', value: 'small' },
        ],
        defaultValue: 'middle',
      },
      {
        name: 'danger',
        label: '危险按钮',
        type: 'boolean',
        defaultValue: false,
      },
    ],
  },
  {
    type: 'antd.Input',
    name: '输入框',
    category: 'antd',
    defaultProps: {
      placeholder: '请输入',
      allowClear: true,
    },
    propConfig: [
      {
        name: 'placeholder',
        label: '占位符',
        type: 'string',
      },
      {
        name: 'allowClear',
        label: '允许清除',
        type: 'boolean',
        defaultValue: true,
      },
    ],
  },
];

export default antdMaterials;