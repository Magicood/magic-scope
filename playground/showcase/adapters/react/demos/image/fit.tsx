import type { ImageFit } from '@magic-scope/react';
import { Image } from '@magic-scope/react';

const FITS: ImageFit[] = ['cover', 'contain', 'fill', 'none', 'scale-down'];

// 同一张较宽的图塞进固定方框,直观对比不同 object-fit 的裁切/留白表现
const SRC = 'https://picsum.photos/id/1025/640/360';

export default function Demo() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--ms-space-4)',
      }}
    >
      {FITS.map((fit) => (
        <figure key={fit} style={{ margin: 0, display: 'grid', gap: 'var(--ms-space-2)' }}>
          <Image
            src={SRC}
            alt={`填充方式 ${fit}`}
            width={140}
            height={140}
            fit={fit}
            rounded="md"
            style={{ border: '1px solid var(--ms-color-border)' }}
          />
          <figcaption
            style={{
              fontSize: '0.8rem',
              color: 'var(--ms-color-fg-muted)',
              textAlign: 'center',
            }}
          >
            {fit}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
