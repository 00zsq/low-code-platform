import type { ComponentDefinition } from '../../types/editor';

const advancedMaterials: ComponentDefinition[] = [
  {
    type: 'CustomTable',
    name: '表格',
    category: 'advanced',
    defaultProps: {
      width: '400px',
      height: '200px',
      bordered: true,
      columnsJson:
        '[{"title":"名称","dataIndex":"name"},{"title":"年龄","dataIndex":"age"}]',
      dataJson: '[{"name":"张三","age":28},{"name":"李四","age":22}]',
    },
    propConfig: [
      { name: 'width', label: '宽度', type: 'string', defaultValue: '400px' },
      { name: 'height', label: '高度', type: 'string', defaultValue: '200px' },
      { name: 'bordered', label: '边框', type: 'boolean', defaultValue: true },
      { name: 'columnsJson', label: '列(JSON)', type: 'string' },
      { name: 'dataJson', label: '数据(JSON)', type: 'string' },
    ],
  },
  {
    type: 'BarChart',
    name: '柱状图',
    category: 'advanced',
    defaultProps: {
      width: '400px',
      height: '240px',
      barColor: '#1677ff',
      dataJson:
        '[{"label":"A","value":30},{"label":"B","value":50},{"label":"C","value":20}]',
    },
    propConfig: [
      { name: 'width', label: '宽度', type: 'string', defaultValue: '400px' },
      { name: 'height', label: '高度', type: 'string', defaultValue: '240px' },
      {
        name: 'barColor',
        label: '柱色',
        type: 'color',
        defaultValue: '#1677ff',
      },
      { name: 'dataJson', label: '数据(JSON)', type: 'string' },
    ],
  },
];

export default advancedMaterials;
