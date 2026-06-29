import { Table } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const columns = [
  { key: 'name', header: '成员' },
  { key: 'school', header: '团队' },
  { key: 'cost', header: '任务数', align: 'end' as const },
];

const data = [
  { name: 'Mira Chen', school: '产品', cost: 3 },
  { name: 'Jonas Park', school: '研发', cost: 7 },
  { name: 'Ann Lee', school: '设计', cost: 5 },
];

function Playground({ values }: { values: ControlValues }) {
  return (
    <Table
      columns={columns}
      data={data}
      stripe={values.stripe as boolean}
      hoverable={values.hoverable as boolean}
      style={{ inlineSize: 'min(420px, 100%)' }}
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/table/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/table/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'table',
  Playground,
  demos: buildDemos(comps, reactSources),
};
