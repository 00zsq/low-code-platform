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
];

export default basicMaterials;
