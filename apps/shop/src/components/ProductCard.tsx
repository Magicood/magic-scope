import { Badge, Button, Rate, Tag } from '@magic-scope/react';
import { CATEGORY_LABEL, formatPrice, type Product, ROAST_LABEL } from '../data/catalog';
import { addToCart } from '../lib/cart';
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
  };

  return (
    <a
      href={`#/product/${product.id}`}
      className="db-card db-card--interactive"
      aria-label={product.name}
    >
      <div style={{ position: 'relative' }}>
        <ProductVisual product={product} />
        {product.badge && (
          <Badge
            tone="primary"
            variant="solid"
            size="sm"
            style={{ position: 'absolute', insetBlockStart: '0.7rem', insetInlineStart: '0.7rem' }}
          >
            {product.badge}
          </Badge>
        )}
        {product.compareAt && (
          <Badge
            tone="danger"
            variant="soft"
            size="sm"
            style={{ position: 'absolute', insetBlockStart: '0.7rem', insetInlineEnd: '0.7rem' }}
          >
            特惠
          </Badge>
        )}
      </div>

      <div style={{ padding: '0.95rem 1.05rem 1.1rem', display: 'grid', gap: '0.5rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag size="sm" variant="soft" tone="neutral">
            {meta}
          </Tag>
          <span style={{ fontSize: '0.78rem', color: 'var(--ms-color-fg-subtle)' }}>
            {product.subtitle}
          </span>
        </div>

        <strong
          style={{
            fontFamily: 'var(--ms-font-display)',
            fontSize: '1.08rem',
            lineHeight: 1.25,
            color: 'var(--ms-color-fg)',
          }}
        >
          {product.name}
        </strong>

        <p
          style={{
            margin: 0,
            fontSize: '0.85rem',
            color: 'var(--ms-color-fg-muted)',
            lineHeight: 1.5,
            overflowWrap: 'anywhere',
          }}
        >
          {product.blurb}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Rate value={product.rating} readOnly allowHalf size="sm" />
          <span style={{ fontSize: '0.78rem', color: 'var(--ms-color-fg-subtle)' }}>
            {product.rating} · {product.reviewCount} 评价
          </span>
        </div>

        <div
          style={{
            marginBlockStart: 'auto',
            paddingBlockStart: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <span className="db-price" style={{ fontSize: '1.15rem' }}>
            {formatPrice(product.price)}
            {product.compareAt && (
              <span className="db-price__was">{formatPrice(product.compareAt)}</span>
            )}
          </span>
          <Button size="sm" variant="soft" onClick={onAdd}>
            加入
          </Button>
        </div>
      </div>
    </a>
  );
}
