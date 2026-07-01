import {
  Toggle,
  type ToggleShape,
  type ToggleSize,
  type ToggleTone,
  type ToggleVariant,
} from '@magic-scope/react';
import { type ComponentType, useEffect, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const initial = values.defaultPressed as boolean;
  const [pressed, setPressed] = useState(initial);

  // 「初始按下」旋钮变化时同步重置受控值,便于实时预览。
  useEffect(() => {
    setPressed(initial);
  }, [initial]);

  const label = (values.label as string) || '加粗 B';
  const iconOnly = values.iconOnly as boolean;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
      <Toggle
        pressed={pressed}
        onPressedChange={setPressed}
        variant={values.variant as ToggleVariant}
        tone={values.tone as ToggleTone}
        size={values.size as ToggleSize}
        shape={values.shape as ToggleShape}
        iconOnly={iconOnly}
        glow={values.glow as boolean}
        disabled={values.disabled as boolean}
        aria-label={label}
      >
        {iconOnly ? 'B' : label}
      </Toggle>
      <span style={{ color: 'var(--ms-color-fg-muted)', userSelect: 'none' }}>
        {pressed ? '已激活' : '未激活'}
      </span>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/toggle/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/toggle/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'toggle',
  Playground,
  demos: buildDemos(comps, reactSources),
};
