import type { ComponentDefinition } from '../../types/editor';

const basicMaterials: ComponentDefinition[] = [
  {
    type: 'Text',
    name: '文本',
    category: 'basic',
    defaultProps: {
      content: '示例文本',
      fontSize: 16,
      color: '#000000',
      textAlign: 'left',
    },
    propConfig: [
      {
        name: 'content',
        label: '内容',
        type: 'string',
      },
      {
        name: 'fontSize',
        label: '字体大小',
        type: 'number',
        defaultValue: 16,
      },
      {
        name: 'color',
        label: '颜色',
        type: 'color',
        defaultValue: '#000000',
      },
      {
        name: 'textAlign',
        label: '对齐方式',
        type: 'select',
        options: [
          { label: '左对齐', value: 'left' },
          { label: '居中', value: 'center' },
          { label: '右对齐', value: 'right' },
        ],
        defaultValue: 'left',
      },
      {
        name: 'type',
        label: '类型',
        type: 'string',
        options: [
          { label: '左对齐', value: 'left' },
          { label: '居中', value: 'center' },
          { label: '右对齐', value: 'right' },
        ],
        defaultValue: 'left',
      },
    ],
  },
  {
    type: 'Image',
    name: '图片',
    category: 'basic',
    defaultProps: {
      src: 'https://www.bing.com/images/search?view=detailV2&ccid=hUCa1yrP&id=311BF52350800871372C516FEE8F27B621887B02&thid=OIP.hUCa1yrPwDM4i7WDt6AfgQHaHa&mediaurl=https%3a%2f%2fc-ssl.duitang.com%2fuploads%2fitem%2f202006%2f13%2f20200613113310_ABn3N.jpeg&exph=1600&expw=1600&q=02%e5%8a%a8%e6%bc%ab%e5%9b%be%e7%89%87&simid=608000880143118865&FORM=IRPRST&ck=43D9E0E9E5980B7FF92FEDDCCF7425D9&selectedIndex=15&itb=0',
      alt: '示例图片',
      width: '150px',
    },
    propConfig: [
      {
        name: 'src',
        label: '图片链接',
        type: 'string',
      },
      {
        name: 'alt',
        label: '替代文字',
        type: 'string',
      },
      {
        name: 'width',
        label: '宽度',
        type: 'string',
        defaultValue: '150px',
      },
    ],
  },
  {
    type: 'Div',
    name: '容器块',
    category: 'basic',
    defaultProps: {
      content: '容器内容',
      backgroundColor: '#fafafa',
      padding: '12px',
      borderRadius: '6px',
      width: '200px',
      height: '100px',
    },
    propConfig: [
      { name: 'content', label: '内容', type: 'string' },
      {
        name: 'backgroundColor',
        label: '背景色',
        type: 'color',
        defaultValue: '#fafafa',
      },
      {
        name: 'padding',
        label: '内边距',
        type: 'string',
        defaultValue: '12px',
      },
      {
        name: 'borderRadius',
        label: '圆角',
        type: 'string',
        defaultValue: '6px',
      },
      { name: 'width', label: '宽度', type: 'string', defaultValue: '200px' },
      { name: 'height', label: '高度', type: 'string', defaultValue: '100px' },
    ],
  },
  {
    type: 'FlexContainer',
    name: 'Flex 容器',
    category: 'container',
    defaultProps: {
      direction: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '8px',
      padding: '8px',
      backgroundColor: '#fff',
      minHeight: '80px',
      width: '300px',
      height: '150px',
    },
    propConfig: [
      {
        name: 'direction',
        label: '方向',
        type: 'select',
        options: [
          { label: '水平', value: 'row' },
          { label: '垂直', value: 'column' },
        ],
        defaultValue: 'row',
      },
      {
        name: 'justifyContent',
        label: '主轴对齐',
        type: 'select',
        options: [
          { label: '起始', value: 'flex-start' },
          { label: '居中', value: 'center' },
          { label: '末端', value: 'flex-end' },
          { label: '两端', value: 'space-between' },
          { label: '等分', value: 'space-around' },
        ],
        defaultValue: 'flex-start',
      },
      {
        name: 'alignItems',
        label: '交叉对齐',
        type: 'select',
        options: [
          { label: '起始', value: 'flex-start' },
          { label: '居中', value: 'center' },
          { label: '末端', value: 'flex-end' },
          { label: '拉伸', value: 'stretch' },
        ],
        defaultValue: 'center',
      },
      { name: 'gap', label: '间距', type: 'string', defaultValue: '8px' },
      { name: 'padding', label: '内边距', type: 'string', defaultValue: '8px' },
      {
        name: 'backgroundColor',
        label: '背景色',
        type: 'color',
        defaultValue: '#fff',
      },
      {
        name: 'minHeight',
        label: '最小高度',
        type: 'string',
        defaultValue: '80px',
      },
      { name: 'width', label: '宽度', type: 'string', defaultValue: '300px' },
      { name: 'height', label: '高度', type: 'string', defaultValue: '150px' },
    ],
  },
];

export default basicMaterials;
