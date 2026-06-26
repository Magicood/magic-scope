import type { ColorFormat, ColorPickerSize } from '@magic-scope/react';
import { ColorPicker } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

// 演示用品牌预设色板(magic 主题色),点击即选中。
const PRESETS = [
  '#7c3aed',
  '#2563eb',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#111827',
];

function Playground({ values }: { values: ControlValues }) {
  const [color, setColor] = useState('#7c3aed');
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <ColorPicker
        value={color}
        onChange={setColor}
        presets={PRESETS}
        size={values.size as ColorPickerSize}
        format={values.format as ColorFormat}
        alpha={values.alpha as boolean}
        formatSwitcher={values.formatSwitcher as boolean}
        disabled={values.disabled as boolean}
        // biome-ignore lint/suspicious/noExplicitAny: placement 为 Popover 的 12 向联合,旋钮值为字符串子集
        placement={values.placement as any}
        aria-label="主题色"
      />
      <code style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.9rem' }}>{color}</code>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/color-picker/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/color-picker/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'color-picker',
  Playground,
  demos: buildDemos(comps, reactSources),
};
