import type { ImageFit, ImageRadius } from '@magic-scope/react';
import { Image } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const SRC = 'https://picsum.photos/id/1043/480/320';

function Playground({ values }: { values: ControlValues }) {
  return (
    <Image
      src={SRC}
      alt="林间小径"
      width={320}
      height={220}
      fit={values.fit as ImageFit}
      rounded={values.rounded as ImageRadius}
      decoding={values.decoding as 'sync' | 'async' | 'auto'}
      preview={values.preview as boolean}
      lazy={values.lazy as boolean}
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/image/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/image/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'image',
  Playground,
  demos: buildDemos(comps, reactSources),
};
