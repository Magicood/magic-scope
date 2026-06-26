import type { TreeNode, TreeSize } from '@magic-scope/react';
import { Tree } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const data: TreeNode[] = [
  {
    key: 'spellbook',
    title: '法术书',
    icon: '📕',
    children: [
      {
        key: 'arcane',
        title: '奥术系',
        icon: '🔮',
        children: [
          { key: 'arcane-bolt', title: '奥术飞弹', icon: '✨' },
          { key: 'arcane-blink', title: '闪现', icon: '✨' },
          { key: 'arcane-sealed', title: '禁咒(已封印)', icon: '🚫', disabled: true },
        ],
      },
      {
        key: 'frost',
        title: '冰霜系',
        icon: '❄️',
        children: [
          { key: 'frost-nova', title: '冰霜新星', icon: '❄️' },
          { key: 'frost-armor', title: '寒冰护甲', icon: '🛡️' },
        ],
      },
    ],
  },
  {
    key: 'reagents',
    title: '材料库',
    icon: '🧪',
    children: [
      { key: 'mana-crystal', title: '魔力水晶', icon: '💎' },
      { key: 'phoenix-ash', title: '凤凰灰烬', icon: '🔥' },
    ],
  },
];

function Playground({ values }: { values: ControlValues }) {
  const [selected, setSelected] = useState<string[]>(['frost-nova']);
  const [checked, setChecked] = useState<string[]>(['frost-armor']);
  return (
    <div style={{ inlineSize: 'min(320px, 100%)' }}>
      <Tree
        data={data}
        defaultExpandedKeys={['spellbook', 'arcane', 'frost', 'reagents']}
        size={values.size as TreeSize}
        checkable={values.checkable as boolean}
        multiple={values.multiple as boolean}
        showIcon={values.showIcon as boolean}
        showLine={values.showLine as boolean}
        blockNode={values.blockNode as boolean}
        selectedKeys={selected}
        onSelect={(keys) => setSelected(keys)}
        checkedKeys={checked}
        onCheck={(keys) => setChecked(keys)}
      />
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/tree/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/tree/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'tree',
  Playground,
  demos: buildDemos(comps, reactSources),
};
