import { Marquee } from '@magic-scope/react';
import type { ReactNode } from 'react';
import { IconCup, IconLeaf, IconTruck } from '../components/icons';
import { trust } from '../data/catalog';

function trustIcon(index: number): ReactNode {
  switch (index % 3) {
    case 0:
      return <IconLeaf />;
    case 1:
      return <IconTruck />;
    default:
      return <IconCup />;
  }
}

export function TrustBar() {
  if (trust.length === 0) {
    return null;
  }

  return (
    <section
      className="db-section--tight"
      aria-label="服务承诺"
      style={{
        borderBlock: '1px solid color-mix(in srgb, var(--ms-color-border) 60%, transparent)',
        backgroundColor: 'var(--ms-color-surface-sunken)',
      }}
    >
      <Marquee
        speed={26}
        pauseOnHover
        gradient
        gradientColor="var(--ms-color-surface-sunken)"
        gradientWidth="12%"
        gap="0.5rem"
        aria-label="精品咖啡服务承诺滚动展示"
      >
        {trust.map((item, index) => {
          return (
            <span
              key={item}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                paddingInline: 'clamp(1.25rem, 3.5vw, 2.5rem)',
                color: 'var(--ms-color-fg-muted)',
                fontSize: '0.875rem',
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  inlineSize: '1.05rem',
                  blockSize: '1.05rem',
                  flexShrink: 0,
                  color: 'var(--ms-color-primary)',
                }}
              >
                {trustIcon(index)}
              </span>
              {item}
            </span>
          );
        })}
      </Marquee>
    </section>
  );
}
