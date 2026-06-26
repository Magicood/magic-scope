import type { TreeNode } from '@magic-scope/react';
import { Tree } from '@magic-scope/react';
import { useRef, useState } from 'react';

const data: TreeNode[] = [
  {
    key: 'root',
    title: '项目',
    children: [
      {
        key: 'app',
        title: 'app',
        children: [
          { key: 'home', title: 'home' },
          { key: 'about', title: 'about' },
        ],
      },
      { key: 'lib', title: 'lib' },
    ],
  },
];

const titleOf = (node: TreeNode): string =>
  typeof node.title === 'string' ? node.title : node.key;

export default function Demo() {
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(360px, 100%)' }}
    >
      <Tree
        data={data}
        checkable
        defaultExpandAll
        defaultSelectedKeys={['home']}
        onSelect={(keys, info) =>
          push(
            `onSelect([${keys.join(', ')}], node=${titleOf(info.node)}, selected=${info.selected})`,
          )
        }
        onCheck={(keys, info) =>
          push(`onCheck([${keys.join(', ')}], 半选=[${info.halfCheckedKeys.join(', ')}])`)
        }
        onExpandedChange={(keys) => push(`onExpandedChange([${keys.join(', ')}])`)}
      />
      {log.length > 0 && (
        <ul
          style={{
            margin: 0,
            paddingInlineStart: '1.1rem',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.8rem',
          }}
        >
          {log.map((e) => (
            <li key={e.id}>{e.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
