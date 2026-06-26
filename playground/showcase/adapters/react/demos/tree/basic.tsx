import type { TreeNode } from '@magic-scope/react';
import { Tree } from '@magic-scope/react';

const data: TreeNode[] = [
  {
    key: 'src',
    title: 'src',
    children: [
      {
        key: 'components',
        title: 'components',
        children: [
          { key: 'button', title: 'Button.tsx' },
          { key: 'tree', title: 'Tree.tsx' },
        ],
      },
      { key: 'index', title: 'index.ts' },
    ],
  },
  {
    key: 'docs',
    title: 'docs',
    children: [{ key: 'readme', title: 'README.md' }],
  },
];

export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(300px, 100%)' }}>
      <Tree data={data} defaultExpandedKeys={['src', 'components']} />
    </div>
  );
}
