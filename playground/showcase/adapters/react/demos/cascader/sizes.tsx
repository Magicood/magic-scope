import type { CascaderOption, CascaderSize } from '@magic-scope/react';
import { Cascader } from '@magic-scope/react';

// 三档尺寸:sm / md / lg,trigger 与浮层菜单随之缩放(并叠加 data-ms-density)。
const options: CascaderOption[] = [
  {
    value: 'frontend',
    label: '前端',
    children: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
    ],
  },
  {
    value: 'backend',
    label: '后端',
    children: [
      { value: 'go', label: 'Go' },
      { value: 'rust', label: 'Rust' },
    ],
  },
];

const sizes: { size: CascaderSize; label: string }[] = [
  { size: 'sm', label: 'sm 紧凑' },
  { size: 'md', label: 'md 默认' },
  { size: 'lg', label: 'lg 宽松' },
];

export default function Demo() {
  return (
    <div
      style={{ display: 'flex', gap: 'var(--ms-space-3)', flexWrap: 'wrap', alignItems: 'center' }}
    >
      {sizes.map(({ size, label }) => (
        <div key={size} style={{ display: 'grid', gap: 'var(--ms-space-1)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
          <Cascader
            size={size}
            options={options}
            defaultValue={['frontend', 'react']}
            aria-label={label}
          />
        </div>
      ))}
    </div>
  );
}
