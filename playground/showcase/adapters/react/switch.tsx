import { Switch, type SwitchSize, type SwitchTone } from '@magic-scope/react';
import { type ComponentType, useEffect, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const initial = values.defaultChecked as boolean;
  const [checked, setChecked] = useState(initial);

  // 旋钮里的「初始开启」变化时,同步重置受控值,便于实时预览。
  useEffect(() => {
    setChecked(initial);
  }, [initial]);

  const label = (values.label as string) || '启用魔法';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
      <Switch
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        tone={values.tone as SwitchTone}
        size={values.size as SwitchSize}
        loading={values.loading as boolean}
        disabled={values.disabled as boolean}
        aria-label={label}
      />
      <span style={{ color: 'var(--ms-color-fg-muted)', userSelect: 'none' }}>
        {label}:{checked ? '开 ✦' : '关'}
      </span>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/switch/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/switch/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'switch',
  Playground,
  demos: buildDemos(comps, reactSources),
};
