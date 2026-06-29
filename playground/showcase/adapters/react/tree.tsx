import type { TreeNode, TreeSize } from '@magic-scope/react';
import { Tree } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const data: TreeNode[] = [
  {
    key: 'spellbook',
    title: '工作区',
    icon: '🗂️',
    children: [
      {
        key: 'arcane',
        title: '概览',
        icon: '📊',
        children: [
          { key: 'arcane-bolt', title: '仪表盘', icon: '📈' },
          { key: 'arcane-blink', title: '活动日志', icon: '🕑' },
          { key: 'arcane-sealed', title: '计费(未开通)', icon: '🔒', disabled: true },
        ],
      },
      {
        key: 'frost',
        title: '团队',
        icon: '👥',
        children: [
          { key: 'frost-nova', title: '成员', icon: '🧑' },
          { key: 'frost-armor', title: '权限', icon: '🛡️' },
        ],
      },
    ],
  },
  {
    key: 'reagents',
    title: '资源库',
    icon: '📦',
    children: [
      { key: 'mana-crystal', title: '设计令牌', icon: '🎨' },
      { key: 'phoenix-ash', title: '部署记录', icon: '🚀' },
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
