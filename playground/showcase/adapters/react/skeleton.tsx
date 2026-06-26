import type { SkeletonVariant } from '@magic-scope/react';
import { Skeleton } from '@magic-scope/react';
import type { ComponentType, CSSProperties } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const variant = values.variant as SkeletonVariant;
  const style: CSSProperties =
    variant === 'circle'
      ? { inlineSize: '4rem', blockSize: '4rem' }
      : variant === 'text'
        ? { inlineSize: 'min(14rem, 80vw)' }
        : { inlineSize: 'min(14rem, 80vw)', blockSize: '5rem' };
  return <Skeleton variant={variant} style={style} />;
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/skeleton/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/skeleton/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'skeleton',
  Playground,
  demos: buildDemos(comps, reactSources),
};
