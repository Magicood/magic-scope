import type {
  DescriptionsItem,
  DescriptionsLayout,
  DescriptionsSize,
  DescriptionsTone,
} from '@magic-scope/react';
import { Descriptions } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const items: DescriptionsItem[] = [
  { key: 'name', label: '成员', value: 'Mira Chen' },
  { key: 'role', label: '角色', value: '产品负责人' },
  { key: 'level', label: '权限', value: 'Owner 管理员' },
  { key: 'seats', label: '席位上限', value: '1280' },
  { key: 'scope', label: '可访问项目', value: 'Atlas · Beacon · Relay' },
  { key: 'team', label: '所属团队', value: '平台体验组', span: 2 },
];

function Playground({ values }: { values: ControlValues }) {
  return (
    <Descriptions
      items={items}
      title="成员档案"
      layout={values.layout as DescriptionsLayout}
      size={values.size as DescriptionsSize}
      tone={values.tone as DescriptionsTone}
      columns={values.columns as number}
      bordered={values.bordered as boolean}
      colon={values.colon as boolean}
      style={{ inlineSize: 'min(560px, 100%)' }}
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/descriptions/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/descriptions/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'descriptions',
  Playground,
  demos: buildDemos(comps, reactSources),
};
