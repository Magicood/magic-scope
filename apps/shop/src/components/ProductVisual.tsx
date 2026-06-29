import type { CSSProperties } from 'react';
import { type Product, ROAST_LABEL, type Roast } from '../data/catalog';

const ROAST_LEVEL: Record<Roast, number> = {
  light: 1,
  medium: 2,
  'medium-dark': 3,
  dark: 4,
};

function GearArt({ id }: { id: string }) {
  const common = {
    fill: 'none',
    stroke: 'var(--ms-color-fg)',
    strokeWidth: 3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    opacity: 0.82,
  };
  if (id === 'grinder') {
    return (
      <svg viewBox="0 0 200 200" width="44%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <circle cx="100" cy="40" r="5" {...common} />
        <path d="M100 45v20M100 56h32" {...common} />
        <rect x="72" y="66" width="56" height="32" rx="5" {...common} />
        <rect x="66" y="98" width="68" height="58" rx="9" {...common} />
        <path d="M66 122h68" {...common} />
      </svg>
    );
  }
  if (id === 'kettle') {
    return (
      <svg viewBox="0 0 200 200" width="50%" aria-hidden="true" style={{ overflow: 'visible' }}>
        <path d="M58 92q42-15 84 0l-9 58q-33 10-66 0z" {...common} />
        <path d="M138 100q33-2 35-38 0-10-10-10" {...common} />
        <path d="M70 92q28-32 0-40" {...common} />
        <path d="M84 150q16 8 32 0" {...common} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 200" width="48%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <path d="M56 64h88l-30 66h-28z" {...common} />
      <path d="M70 96h60" {...common} />
      <path d="M88 130l-9 30h42l-9-30" {...common} />
      <path d="M100 64v66" {...common} opacity="0.4" />
    </svg>
  );
}

interface ProductVisualProps {
  product: Product;
  className?: string;
  style?: CSSProperties;
}

/**
 * 商品主视觉:art-directed 富色场 + 哑光咖啡袋(豆)或精致线描(器具)。
 * 无实拍图,但走「品牌包装视觉」路线 —— 排版标签让它像刻意设计而非凑数。
 */
export function ProductVisual({ product, className, style }: ProductVisualProps) {
  const isBean = product.type === 'bean';
  const level = product.roast ? ROAST_LEVEL[product.roast] : 0;

  return (
    <div
      className={['pv', className].filter(Boolean).join(' ')}
      style={{ ['--pv-accent' as string]: product.accent, ...style }}
      aria-hidden="true"
    >
      {isBean ? (
        <div className="pv__bag">
          <div className="pv__bag-top" />
          <div className="pv__label">
            <span className="pv__roast">{product.roast ? ROAST_LABEL[product.roast] : ''}</span>
            <span className="pv__name">{product.name}</span>
            <span className="pv__origin">{product.subtitle}</span>
            <span className="pv__dots">
              {[1, 2, 3, 4].map((n) => (
                <i key={n} data-on={n <= level ? '' : undefined} />
              ))}
            </span>
            <span className="pv__wm">DAYBREAK · 昼起</span>
          </div>
        </div>
      ) : (
        <div className="pv__gear">
          <GearArt id={product.id} />
        </div>
      )}
    </div>
  );
}
