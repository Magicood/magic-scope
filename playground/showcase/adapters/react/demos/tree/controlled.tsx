import type { TreeNode } from '@magic-scope/react';
import { Tree } from '@magic-scope/react';
import { useState } from 'react';

const data: TreeNode[] = [
  {
    key: 'continent',
    title: '大陆',
    children: [
      {
        key: 'asia',
        title: '亚洲',
        children: [
          { key: 'cn', title: '中国' },
          { key: 'jp', title: '日本' },
        ],
      },
      {
        key: 'europe',
        title: '欧洲',
        children: [
          { key: 'fr', title: '法国' },
          { key: 'de', title: '德国' },
        ],
      },
    ],
  },
];

const ALL_EXPANDED = ['continent', 'asia', 'europe'];

export default function Demo() {
  // 受控展开:外部按钮直接驱动 expandedKeys
  const [expanded, setExpanded] = useState<string[]>(['continent']);
  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(300px, 100%)' }}
    >
      <div style={{ display: 'flex', gap: 'var(--ms-space-2, 0.5rem)' }}>
        <button
          type="button"
          onClick={() => setExpanded(ALL_EXPANDED)}
          style={{
            padding: '0.3rem 0.7rem',
            borderRadius: 'var(--ms-radius-md, 0.5rem)',
            border: '1px solid var(--ms-color-border)',
            background: 'var(--ms-color-bg-subtle, transparent)',
            color: 'var(--ms-color-fg)',
            cursor: 'pointer',
            fontSize: '0.82rem',
          }}
        >
          全部展开
        </button>
        <button
          type="button"
          onClick={() => setExpanded([])}
          style={{
            padding: '0.3rem 0.7rem',
            borderRadius: 'var(--ms-radius-md, 0.5rem)',
            border: '1px solid var(--ms-color-border)',
            background: 'var(--ms-color-bg-subtle, transparent)',
            color: 'var(--ms-color-fg)',
            cursor: 'pointer',
            fontSize: '0.82rem',
          }}
        >
          全部折叠
        </button>
      </div>
      <Tree data={data} expandedKeys={expanded} onExpandedChange={(keys) => setExpanded(keys)} />
    </div>
  );
}
