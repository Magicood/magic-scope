import { Rate, toast } from '@magic-scope/react';
import { CATEGORY_LABEL, formatPrice, type Product, ROAST_LABEL } from '../data/catalog';
import { addToCart } from '../lib/cart';
import { IconPlus } from './icons';
import { ProductVisual } from './ProductVisual';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const meta = product.roast ? ROAST_LABEL[product.roast] : CATEGORY_LABEL[product.category];

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      {
        id: product.id,
        name: product.name,
        variant: product.type === 'bean' ? '250g · 整豆' : '标准',
        price: product.price,
        accent: product.accent,
      },
      1,
    );
    toast.success('已加入购物车');
  };

  return (
    <a href={`#/product/${product.id}`} className="db-pcard" aria-label={product.name}>
      <div className="db-pcard__media">
        <ProductVisual product={product} />
        {(product.badge || product.compareAt) && (
          <div className="db-pcard__badges">
            <span>{product.badge && <span className="db-pcard__tag">{product.badge}</span>}</span>
            {product.compareAt && <span className="db-pcard__tag db-pcard__tag--sale">特惠</span>}
          </div>
        )}
      </div>

      <div className="db-pcard__body">
        <span className="db-pcard__meta">
          {meta} · {product.subtitle}
        </span>
        <span className="db-pcard__name">{product.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Rate value={product.rating} readOnly allowHalf size="sm" tone="warning" />
          <span style={{ fontSize: '0.78rem', color: 'var(--ms-color-fg-subtle)' }}>
            {product.rating} · {product.reviewCount}
          </span>
        </div>

        <div className="db-pcard__foot">
          <span className="db-price" style={{ fontSize: '1.2rem' }}>
            {formatPrice(product.price)}
            {product.compareAt && (
              <span className="db-price__was">{formatPrice(product.compareAt)}</span>
            )}
          </span>
          <button
            type="button"
            className="db-add"
            onClick={onAdd}
            aria-label={`将 ${product.name} 加入购物车`}
          >
            <IconPlus />
          </button>
        </div>
      </div>
    </a>
  );
}
