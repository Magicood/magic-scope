import { useState } from 'react';
import type { TableColumn } from '../../../packages/react/src/index';
import { Button, Table } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

/** 演示用数据:奥术法术清单。 */
const SPELLS: Array<Record<string, string>> = [
  { name: '奥术飞弹', school: '塑能', cost: '1', power: '★★☆' },
  { name: '冰霜新星', school: '冰霜', cost: '3', power: '★★★' },
  { name: '法术反制', school: '防护', cost: '2', power: '★★☆' },
  { name: '虚空爆裂', school: '暗影', cost: '5', power: '★★★' },
  { name: '相位闪现', school: '幻象', cost: '2', power: '★☆☆' },
];

const COLUMNS: TableColumn[] = [
  { key: 'name', header: '法术' },
  { key: 'school', header: '学派' },
  { key: 'cost', header: '法力', align: 'center' },
  { key: 'power', header: '威力', align: 'end' },
];

function Demo({ values }: { values: ControlValues }) {
  const [caption, setCaption] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button variant="ghost" size="sm" onClick={() => setCaption((c) => !c)}>
        {caption ? '隐藏 caption' : '显示 caption'}
      </Button>
      <Table
        columns={COLUMNS}
        data={SPELLS}
        stripe={values.stripe as boolean}
        hoverable={values.hoverable as boolean}
        caption={caption ? '奥术法术清单' : undefined}
      />
    </div>
  );
}

export const entry: DocEntry = {
  id: 'table',
  name: 'Table',
  category: 'data',
  summary: '基础数据表格,语义化 <table> + 列定义/行数据驱动,可选斑马纹与行 hover 高亮。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n以 columns(列定义)+ data(行数据)驱动,渲染语义化 <table>:thead 用 th[scope=col] 加粗、surface-raised 底,外层 div 提供圆角边框与横向 overflow。\nstripe 为偶数行加极淡底色,hoverable 让行 hover 换 surface-raised 底;列可按 align 设置 start / center / end 对齐。',
  controls: [
    { type: 'boolean', prop: 'stripe', label: '斑马纹 stripe', default: false },
    { type: 'boolean', prop: 'hoverable', label: '行高亮 hoverable', default: true },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Table } from '@magic-scope/react';

const columns = [
  { key: 'name', header: '法术' },
  { key: 'cost', header: '法力', align: 'center' },
];
const data = [{ name: '奥术飞弹', cost: '1' }];

<Table columns={columns} data={data} stripe hoverable />`,
  props: [
    {
      name: 'columns',
      type: 'TableColumn[]',
      default: '—',
      description: '列定义:{ key, header, align? },key 同时用于取值与 React key。',
    },
    {
      name: 'data',
      type: 'Array<Record<string, ReactNode>>',
      default: '—',
      description: '行数据数组,每行是 字段键 -> 单元格内容 的映射。',
    },
    {
      name: 'stripe',
      type: 'boolean',
      default: 'false',
      description: '斑马纹:为偶数行加极淡底色。',
    },
    {
      name: 'hoverable',
      type: 'boolean',
      default: 'false',
      description: '行 hover 高亮:悬停整行换 surface-raised 底。',
    },
    {
      name: 'getRowKey',
      type: '(row: Record<string, ReactNode>, index: number) => string | number',
      default: '索引',
      description: '自定义行 key 派生,默认用行索引,返回值需在表内唯一。',
    },
    {
      name: 'caption',
      type: 'ReactNode',
      default: '—',
      description: '外框 caption(无障碍标题),设置后渲染 <caption>。',
    },
    {
      name: 'className',
      type: 'string',
      default: '—',
      description: '透传给外层包裹 <div> 的 className。',
    },
    {
      name: 'TableColumn.key',
      type: 'string',
      default: '—',
      description: 'TableColumn:字段键,从行对象取值并作为 React key。',
    },
    {
      name: 'TableColumn.header',
      type: 'ReactNode',
      default: '—',
      description: 'TableColumn:表头内容。',
    },
    {
      name: 'TableColumn.align',
      type: `'start' | 'end' | 'center'`,
      default: `'start'`,
      description: 'TableColumn:列对齐,表头与单元格一致。',
    },
  ],
  examples: [
    {
      title: '斑马纹',
      description: '为偶数行加极淡底色,提升长表可读性。',
      node: <Table columns={COLUMNS} data={SPELLS} stripe />,
    },
    {
      title: '行 hover 高亮 + caption',
      node: <Table columns={COLUMNS} data={SPELLS} hoverable caption="奥术法术清单" />,
    },
  ],
};
