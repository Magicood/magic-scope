import type { TreeNode } from '@magic-scope/react';
import { Tree } from '@magic-scope/react';
import { useState } from 'react';

const data: TreeNode[] = [
  {
    key: 'team',
    title: '研发团队',
    children: [
      {
        key: 'fe',
        title: '前端组',
        children: [
          { key: 'fe-1', title: '阿岚' },
          { key: 'fe-2', title: '小霜' },
          { key: 'fe-3', title: '余烬(在外派,不可选)', disableCheckbox: true },
        ],
      },
      {
        key: 'be',
        title: '后端组',
        children: [
          { key: 'be-1', title: '玄武' },
          { key: 'be-2', title: '青龙' },
        ],
      },
    ],
  },
];

export default function Demo() {
  // 受控勾选:仅含「完全勾选」key,半选由组件从 checkedKeys 自动派生
  const [checked, setChecked] = useState<string[]>(['fe-1']);
  return (
    <div style={{ inlineSize: 'min(320px, 100%)' }}>
      <Tree
        data={data}
        checkable
        defaultExpandAll
        checkedKeys={checked}
        onCheck={(keys) => setChecked(keys)}
      />
      <p
        style={{
          marginBlockStart: 'var(--ms-space-3, 0.75rem)',
          color: 'var(--ms-color-fg-muted)',
          fontSize: '0.82rem',
        }}
      >
        勾选父节点会级联到全部可选后代,半选态(父含部分勾选子)自动呈现;勾上「前端组 /
        后端组」体验级联与半选。
      </p>
    </div>
  );
}
