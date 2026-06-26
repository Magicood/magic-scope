import type { TreeNode } from '@magic-scope/react';
import { Tree } from '@magic-scope/react';

const data: TreeNode[] = [
  {
    key: 'fruit',
    title: '水果',
    children: [
      { key: 'apple', title: '苹果' },
      { key: 'pear', title: '梨' },
      { key: 'grape', title: '葡萄' },
    ],
  },
  {
    key: 'veg',
    title: '蔬菜',
    children: [
      { key: 'carrot', title: '胡萝卜' },
      { key: 'tomato', title: '番茄' },
    ],
  },
];

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: 'var(--ms-space-6, 1.5rem)', flexWrap: 'wrap' }}>
      <div style={{ minInlineSize: '180px' }}>
        <div
          style={{
            marginBlockEnd: 'var(--ms-space-2, 0.5rem)',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.8rem',
          }}
        >
          单选(默认)
        </div>
        <Tree data={data} defaultExpandAll defaultSelectedKeys={['apple']} />
      </div>
      <div style={{ minInlineSize: '180px' }}>
        <div
          style={{
            marginBlockEnd: 'var(--ms-space-2, 0.5rem)',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.8rem',
          }}
        >
          多选 multiple
        </div>
        <Tree data={data} multiple defaultExpandAll defaultSelectedKeys={['apple', 'grape']} />
      </div>
    </div>
  );
}
