import type { TreeNode } from '@magic-scope/react';
import { Tree } from '@magic-scope/react';
import { useState } from 'react';

const data: TreeNode[] = [
  {
    key: 'docs',
    title: '文档',
    children: [
      { key: 'guide', title: '指南' },
      { key: 'api', title: 'API 参考' },
    ],
  },
  {
    key: 'src',
    title: '源码',
    children: [
      { key: 'core', title: 'core' },
      { key: 'react', title: 'react' },
    ],
  },
];

// selectable + 受控 selectedKeys(多选高亮)与 checkable + defaultCheckedKeys(非受控勾选)并存:
// 选中态用于聚焦/定位,勾选态用于批量操作,两套状态独立。
export default function Demo() {
  const [selected, setSelected] = useState<string[]>(['guide']);
  return (
    <div style={{ inlineSize: 'min(320px, 100%)' }}>
      <Tree
        data={data}
        selectable
        multiple
        selectedKeys={selected}
        onSelect={(keys) => setSelected(keys)}
        checkable
        defaultCheckedKeys={['core']}
        defaultExpandAll
      />
    </div>
  );
}
