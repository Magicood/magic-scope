import type { LinkGlow, LinkSize, LinkTone, LinkUnderline } from '@magic-scope/react';
import { Link } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  return (
    <Link
      href="#"
      underline={values.underline as LinkUnderline}
      tone={values.tone as LinkTone}
      size={values.size as LinkSize}
      glow={values.glow as LinkGlow}
      external={values.external as boolean}
      muted={values.muted as boolean}
      disabled={values.disabled as boolean}
    >
      {values.children as string}
    </Link>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/link/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/link/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'link',
  Playground,
  demos: buildDemos(comps, reactSources),
};
