import type { CSSProperties } from 'react';
import { CATEGORY_LABEL, type Product, products, ROAST_LABEL } from '../data/catalog';

interface ProductVisualProps {
  product: Product;
  className?: string;
  style?: CSSProperties;
}

/**
 * 商品主视觉:莫兰迪抽象色卡(Aesop 式)。
 * 不画物件 —— 低饱和莫兰迪色场 + 颗粒材质 + 双层柔光景深 + 巨大编号水印(杂志式
 * 视觉锚点)+ 展览级大衬线产品名 + 极致留白。10 个商品是「同款不同色」的一组高级色卡。
 */
export function ProductVisual({ product, className, style }: ProductVisualProps) {
  const index = products.findIndex((p) => p.id === product.id);
  const no = String(index + 1).padStart(2, '0');
  const tag = product.roast ? ROAST_LABEL[product.roast] : CATEGORY_LABEL[product.category];
  const origin = product.type === 'bean' ? (product.origin ?? product.subtitle) : product.subtitle;

  return (
    <div
      className={['pv', className].filter(Boolean).join(' ')}
      style={{ ['--pv-accent' as string]: product.accent, ...style }}
      aria-hidden="true"
    >
      <span className="pv__grain" />
      <span className="pv__watermark">{no}</span>

      <div className="pv__card">
        <div className="pv__top">
          <span className="pv__index">N° {no}</span>
          <span className="pv__tag">{tag}</span>
        </div>

        <div className="pv__mid">
          <span className="pv__origin">{origin}</span>
          <p className="pv__name">{product.name}</p>
        </div>

        <div className="pv__bottom">
          <span className="pv__flavors">{product.flavors.join(' · ')}</span>
        </div>
      </div>
    </div>
  );
}
