import type { ObjectFit } from '@magic-scope/react';
import { AspectRatio } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

type Rounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

function Playground({ values }: { values: ControlValues }) {
  return (
    <AspectRatio
      as="div"
      ratio={values.ratio as string}
      objectFit={values.objectFit as ObjectFit}
      rounded={values.rounded as Rounded}
      clip={values.clip as boolean}
      style={{ inlineSize: 'min(420px, 100%)', border: '1px dashed var(--ms-color-border)' }}
    >
      <img
        src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=900&q=80"
        alt="星空"
        style={{ inlineSize: '100%', blockSize: '100%' }}
      />
    </AspectRatio>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/aspect-ratio/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/aspect-ratio/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'aspect-ratio',
  Playground,
  demos: buildDemos(comps, reactSources),
};
