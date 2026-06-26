import type { ObjectFit } from '@magic-scope/react';
import { AspectRatio } from '@magic-scope/react';

const FITS: ObjectFit[] = ['cover', 'contain', 'fill', 'scale-down'];

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ms-space-4)' }}>
      {FITS.map((fit) => (
        <div key={fit} style={{ inlineSize: 'min(200px, 100%)' }}>
          <AspectRatio
            ratio="1"
            objectFit={fit}
            objectPosition="center"
            rounded="md"
            style={{ background: 'var(--ms-color-bg-subtle)' }}
          >
            <img
              src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=80"
              alt="星空"
              style={{ inlineSize: '100%', blockSize: '100%' }}
            />
          </AspectRatio>
          <p
            style={{
              margin: 'var(--ms-space-2) 0 0',
              textAlign: 'center',
              color: 'var(--ms-color-fg-muted)',
              fontSize: '0.85rem',
            }}
          >
            objectFit={fit}
          </p>
        </div>
      ))}
    </div>
  );
}
