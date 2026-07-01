import type { CSSProperties } from 'react';
import { CATEGORY_LABEL, type Product, products, ROAST_LABEL } from '../data/catalog';

/** 器具填充剪影:深墨实心 + 一道高光 + 接触阴影(比线描更有「产品」实体感)。 */
function GearArt({ id }: { id: string }) {
  const ink = { fill: 'var(--pv-ink)' as const };
  const shine = { fill: 'rgba(255, 255, 255, 0.15)' as const };
  const stroke = {
    fill: 'none' as const,
    stroke: 'var(--pv-ink)' as const,
    strokeWidth: 9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (id === 'kettle') {
    return (
      <svg viewBox="0 0 200 200" aria-hidden="true" style={{ inlineSize: '84%' }}>
        <path {...ink} d="M52 98q48-16 96 0l-11 60q-37 12-74 0z" />
        <path {...ink} d="M140 106q32-5 32-42 0-11-11-11l-2 11q6 0 6 6 0 21-21 25z" />
        <path {...stroke} d="M66 98q30-34 3-42" />
        <ellipse {...ink} cx="100" cy="94" rx="49" ry="9" />
        <rect {...ink} x="92" y="74" width="16" height="16" rx="4" />
        <path {...shine} d="M64 102q16-6 27-5l-6 52q-12-2-23-5z" />
      </svg>
    );
  }

  if (id === 'grinder') {
    return (
      <svg viewBox="0 0 200 200" aria-hidden="true" style={{ inlineSize: '66%' }}>
        <path {...ink} d="M64 78h72l-6 34H70z" />
        <rect {...ink} x="66" y="112" width="68" height="60" rx="10" />
        <path {...stroke} d="M100 78V54h30" />
        <circle {...ink} cx="134" cy="54" r="7" />
        <rect {...shine} x="74" y="118" width="12" height="48" rx="6" />
      </svg>
    );
  }

  // dripper（V60）
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" style={{ inlineSize: '72%' }}>
      <path {...ink} d="M50 74h100l-34 74H84z" />
      <rect {...ink} x="82" y="148" width="36" height="12" rx="3" />
      <rect {...ink} x="66" y="160" width="68" height="9" rx="4" />
      <path {...shine} d="M62 80h15l-19 42h-11z" />
    </svg>
  );
}

interface ProductVisualProps {
  product: Product;
  className?: string;
  style?: CSSProperties;
}

/**
 * 商品主视觉:影棚静物(product still-life)。
 * 无实拍图,用低饱和暖调影棚墙 + 写实咖啡袋 / 器具剪影 + 真实接触阴影,
 * 做到「像精品店拍的产品图」,而非扁平 clip-art。
 */
export function ProductVisual({ product, className, style }: ProductVisualProps) {
  const isBean = product.type === 'bean';
  const index = products.findIndex((p) => p.id === product.id);
  const no = String(index + 1).padStart(2, '0');
  const tag = product.roast ? ROAST_LABEL[product.roast] : CATEGORY_LABEL[product.category];

  return (
    <div
      className={['pv', className].filter(Boolean).join(' ')}
      style={{ ['--pv-accent' as string]: product.accent, ...style }}
      aria-hidden="true"
    >
      <span className="pv__grain" />
      <span className="pv__corner pv__corner--tl">N° {no}</span>
      <span className="pv__corner pv__corner--tr">{tag}</span>

      <div className="pv__stage">
        {isBean ? (
          <div className="pv__bag">
            <span className="pv__bag-cap" />
            <span className="pv__bag-brand-print">Daybreak</span>
            <div className="pv__bag-label">
              <span className="pv__bag-origin">{product.name}</span>
              <span className="pv__bag-roast">{product.subtitle}</span>
            </div>
          </div>
        ) : (
          <div className="pv__gear">
            <GearArt id={product.id} />
          </div>
        )}
      </div>
    </div>
  );
}
