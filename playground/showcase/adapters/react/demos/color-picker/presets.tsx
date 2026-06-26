import { ColorPicker } from '@magic-scope/react';
import { useState } from 'react';

// 预设色板:传入颜色串数组,面板底部渲染为一组可点选色块,
// 命中当前色时高亮;适合复用品牌色 / 设计 token 调色板。
const BRAND = [
  '#7c3aed',
  '#6d28d9',
  '#2563eb',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#64748b',
  '#111827',
];

export default function Demo() {
  const [color, setColor] = useState('#7c3aed');
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <ColorPicker value={color} onChange={setColor} presets={BRAND} aria-label="品牌色" />
      <code style={{ color: 'var(--ms-color-fg-muted)' }}>{color}</code>
    </div>
  );
}
