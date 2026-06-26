import type { PinInputSize, PinInputType } from '@magic-scope/react';
import { PinInput } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [code, setCode] = useState('');
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', justifyItems: 'start' }}>
      <PinInput
        value={code}
        onChange={setCode}
        length={values.length as number}
        type={values.type as PinInputType}
        size={values.size as PinInputSize}
        mask={values.mask as boolean}
        invalid={values.invalid as boolean}
        disabled={values.disabled as boolean}
        aria-label="验证码"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前输入:{code || '(空)'}
      </small>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/pin-input/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/pin-input/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'pin-input',
  Playground,
  demos: buildDemos(comps, reactSources),
};
