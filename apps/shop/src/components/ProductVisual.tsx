import type { CSSProperties } from 'react';
import type { Product } from '../data/types';

/* ============================================================================
 * ProductVisual —— 艺术化商品视觉(art-directed,无位图、无 clip-art)。
 * 每款商品 = 一组低饱和色场 + 一个有体积感的抽象形体(渐变塑形 + 接触阴影)
 * + 细颗粒纹理。所有配方在 shop.css 的 .pv-* 规则里,颜色经 CSS 变量注入,
 * 用 color-mix(in oklab) 派生高光/暗部,保证任何色板下体积关系都成立。
 * ========================================================================== */

export type VisualAspect = 'portrait' | 'square' | 'wide';

export function ProductVisual({
  product,
  aspect = 'portrait',
  className,
}: {
  product: Product;
  aspect?: VisualAspect;
  className?: string;
}) {
  const { visual } = product;
  const style = {
    '--pv-field': visual.field,
    '--pv-tint': visual.tint,
    '--pv-body': visual.body,
    '--pv-shade': visual.shade,
  } as CSSProperties;

  const luminous = product.category === 'lighting';

  return (
    <div
      className={['pv', `pv-${aspect}`, className].filter(Boolean).join(' ')}
      style={style}
      role="img"
      aria-label={`${product.name} — ${product.tagline}`}
    >
      <div className="pv-floor" aria-hidden="true" />
      <div
        className={`pv-form pv-form-${visual.shape}`}
        data-luminous={luminous || undefined}
        aria-hidden="true"
      >
        {visual.shape === 'stack' && (
          <>
            <i />
            <i />
            <i />
          </>
        )}
        {visual.shape === 'cylinder' && <i className="pv-cap" />}
        {visual.shape === 'roll' && (
          <>
            <i className="pv-fold" />
            <i className="pv-fold" />
          </>
        )}
      </div>
      <div className="pv-grain" aria-hidden="true" />
    </div>
  );
}
