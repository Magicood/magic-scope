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
  { key: 'name', label: '法师', value: '艾莉雅·星语' },
  { key: 'school', label: '主修学派', value: '塑能 / 咒法' },
  { key: 'rank', label: '阶位', value: '大魔导师' },
  { key: 'mana', label: '法力上限', value: '1280' },
  { key: 'affinity', label: '元素亲和', value: '奥术 · 寒霜 · 雷' },
  { key: 'guild', label: '所属议会', value: '银月秘法议会', span: 2 },
];

function Playground({ values }: { values: ControlValues }) {
  return (
    <Descriptions
      items={items}
      title="法师档案"
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
