import type { CascaderOption } from '@magic-scope/react';
import { Cascader } from '@magic-scope/react';
import { useState } from 'react';

const options: CascaderOption[] = [
  {
    value: 'design',
    label: '设计',
    children: [
      { value: 'ui', label: 'UI', children: [{ value: 'tokens', label: '设计令牌' }] },
      { value: 'ux', label: 'UX', children: [{ value: 'flows', label: '用户流' }] },
    ],
  },
  {
    value: 'eng',
    label: '工程',
    children: [{ value: 'fe', label: '前端', children: [{ value: 'react', label: 'React' }] }],
  },
];

// separator 自定义路径分隔串;placement 让浮层朝上弹出(top-start)。
export default function Demo() {
  const [path, setPath] = useState<string[]>(['design', 'ui', 'tokens']);
  return (
    <div style={{ display: 'grid', gap: '0.5rem', inlineSize: 'min(300px, 80vw)' }}>
      <Cascader
        options={options}
        value={path}
        onChange={setPath}
        separator=" › "
        placement="top-start"
        aria-label="分类选择"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        路径:{path.length ? path.join(' › ') : '未选择'}
      </small>
    </div>
  );
}
