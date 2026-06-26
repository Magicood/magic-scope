import type { ImageRadius } from '@magic-scope/react';
import { Image } from '@magic-scope/react';

const RADII: ImageRadius[] = ['none', 'sm', 'md', 'lg', 'xl', 'full'];

const SRC = 'https://picsum.photos/id/64/200/200';

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ms-space-4)' }}>
      {RADII.map((rounded) => (
        <figure key={rounded} style={{ margin: 0, display: 'grid', gap: 'var(--ms-space-2)' }}>
          <Image src={SRC} alt={`圆角档 ${rounded}`} width={96} height={96} rounded={rounded} />
          <figcaption
            style={{
              fontSize: '0.8rem',
              color: 'var(--ms-color-fg-muted)',
              textAlign: 'center',
            }}
          >
            {rounded}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
