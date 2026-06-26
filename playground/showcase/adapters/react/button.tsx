import type {
  ButtonGlow,
  ButtonShape,
  ButtonSize,
  ButtonTone,
  ButtonVariant,
} from '@magic-scope/react';
import { Button } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  return (
    <Button
      variant={values.variant as ButtonVariant}
      tone={values.tone as ButtonTone}
      size={values.size as ButtonSize}
      shape={values.shape as ButtonShape}
      glow={values.glow as ButtonGlow}
      loading={values.loading as boolean}
      fullWidth={values.fullWidth as boolean}
      disabled={values.disabled as boolean}
    >
      {values.children as string}
    </Button>
  );
}

// 真实 demo 文件：同一文件既 import 渲染、又 ?raw 取源码（永不漂移）。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/button/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/button/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'button',
  Playground,
  demos: buildDemos(comps, reactSources),
};
