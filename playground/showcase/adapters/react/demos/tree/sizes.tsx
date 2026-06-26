import type { TreeNode } from '@magic-scope/react';
import { Tree } from '@magic-scope/react';

const data: TreeNode[] = [
  {
    key: 'root',
    title: '根目录',
    children: [
      { key: 'a', title: '子节点 A' },
      { key: 'b', title: '子节点 B' },
    ],
  },
];

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: 'var(--ms-space-6, 1.5rem)', flexWrap: 'wrap' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} style={{ minInlineSize: '160px' }}>
          <div
            style={{
              marginBlockEnd: 'var(--ms-space-2, 0.5rem)',
              color: 'var(--ms-color-fg-muted)',
              fontSize: '0.8rem',
            }}
          >
            size={size}
          </div>
          <Tree data={data} size={size} defaultExpandAll />
        </div>
      ))}
    </div>
  );
}
