import { Table } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const columns = [
  { key: 'name', header: '法术' },
  { key: 'school', header: '学派' },
  { key: 'cost', header: '法力', align: 'end' as const },
];

const data = [
  { name: '奥术飞弹', school: '塑能', cost: 3 },
  { name: '传送门', school: '咒法', cost: 7 },
  { name: '心灵感应', school: '惑控', cost: 5 },
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
