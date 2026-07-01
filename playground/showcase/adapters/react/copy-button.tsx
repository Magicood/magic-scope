import { CopyButton } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

// CopyButton 的 tone/size/variant 与 Button 同名字面量,直接透传旋钮值。
type CopyTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
type CopySize = 'sm' | 'md' | 'lg';
type CopyVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link';

function Playground({ values }: { values: ControlValues }) {
  const value = (values.value as string) || 'npm i @magic-scope/react';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
      <code
        style={{
          padding: '0.3rem 0.6rem',
          borderRadius: 'var(--ms-radius-sm)',
          background: 'var(--ms-color-bg-subtle)',
          color: 'var(--ms-color-fg-muted)',
          fontSize: '0.85rem',
        }}
      >
        {value}
      </code>
      <CopyButton
        value={value}
        variant={values.variant as CopyVariant}
        tone={values.tone as CopyTone}
        size={values.size as CopySize}
        withTooltip={values.withTooltip as boolean}
        timeout={values.timeout as number}
      >
        复制
      </CopyButton>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/copy-button/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/copy-button/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'copy-button',
  Playground,
  demos: buildDemos(comps, reactSources),
};
