import type { CascaderOption } from '@magic-scope/react';
import { Cascader } from '@magic-scope/react';
import { useState } from 'react';

// changeOnSelect:点中间节点也立即提交(边选边走),不必非得落到叶子。
// 适合「可以只选到省、也可以继续选到区」这类半路落点场景。对照默认行为(仅叶子可提交)。
const options: CascaderOption[] = [
  {
    value: 'digital',
    label: '数码',
    children: [
      {
        value: 'phone',
        label: '手机',
        children: [
          { value: 'flagship', label: '旗舰' },
          { value: 'budget', label: '入门' },
        ],
      },
      {
        value: 'laptop',
        label: '笔记本',
        children: [
          { value: 'gaming', label: '游戏本' },
          { value: 'ultrabook', label: '轻薄本' },
        ],
      },
    ],
  },
  {
    value: 'home',
    label: '家居',
    children: [
      {
        value: 'kitchen',
        label: '厨房',
        children: [{ value: 'pot', label: '锅具' }],
      },
    ],
  },
];

export default function Demo() {
  const [loose, setLoose] = useState<string[]>(['digital']);
  const [strict, setStrict] = useState<string[]>([]);
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-4)', inlineSize: 'min(320px, 100%)' }}>
      <div style={{ display: 'grid', gap: 'var(--ms-space-1)' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--ms-color-fg-muted)' }}>
          changeOnSelect:选中间节点即提交
        </span>
        <Cascader
          options={options}
          value={loose}
          onChange={setLoose}
          changeOnSelect
          tone="accent"
          aria-label="边选边走"
        />
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>
          路径:{loose.join(' / ') || '空'}
        </small>
      </div>
      <div style={{ display: 'grid', gap: 'var(--ms-space-1)' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--ms-color-fg-muted)' }}>
          默认:仅叶子可提交
        </span>
        <Cascader
          options={options}
          value={strict}
          onChange={setStrict}
          placeholder="逐级选到底…"
          aria-label="仅叶子可提交"
        />
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>
          路径:{strict.join(' / ') || '空'}
        </small>
      </div>
    </div>
  );
}
