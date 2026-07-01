import {
  Breadcrumb,
  Button,
  Empty,
  NumberInput,
  Rate,
  Segmented,
  Select,
  Tabs,
  Tag,
  toast,
} from '@magic-scope/react';
import { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { ProductVisual } from '../components/ProductVisual';
import { Reveal, RevealGroup } from '../components/Reveal';
import {
  formatPrice,
  getProduct,
  grindOptions,
  type Product,
  products,
  ROAST_LABEL,
  reviews,
  weightMultiplier,
  weightOptions,
} from '../data/catalog';
import { addToCart } from '../lib/cart';
import { navigate } from '../lib/router';

interface ProductPageProps {
  id: string;
}

const BREW_TIPS = [
  '手冲:豆水比约 1:15,水温 90–93℃,中细研磨,闷蒸 30 秒后分段注水。',
  '意式:18g 粉萃出约 36g 液重,时间 25–30 秒,根据流速微调研磨度。',
  '存放:开封后挤出空气密封,阴凉避光,建议两周内喝完以获得最佳风味。',
];

export function ProductPage({ id }: ProductPageProps) {
  const product = getProduct(id);
  const [weight, setWeight] = useState('250');
  const [grind, setGrind] = useState('whole');
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <section className="db-section db-container">
        <Empty image="simple" description="没有找到这款商品">
          <Button variant="soft" onClick={() => navigate('/shop')}>
            返回全部商品
          </Button>
        </Empty>
      </section>
    );
  }

  const isBean = product.type === 'bean';
  const weightLabel = weightOptions.find((w) => w.value === weight)?.label ?? weight;
  const grindLabel = grindOptions.find((g) => g.value === grind)?.label ?? grind;
  const unit = isBean ? Math.round(product.price * (weightMultiplier[weight] ?? 1)) : product.price;
  const variant = isBean ? `${weightLabel} · ${grindLabel}` : '标准';
  const lineId = isBean ? `${product.id}-${weight}-${grind}` : product.id;

  const add = (then?: () => void) => {
    addToCart(
      { id: lineId, name: product.name, variant, price: unit, accent: product.accent },
      qty,
    );
    toast.success('已加入购物车');
    then?.();
  };

  const related = products
    .filter((p) => p.id !== product.id && p.type === product.type)
    .slice(0, 4);
  const fallbackRelated = products.filter((p) => p.id !== product.id).slice(0, 4);
  const recommend = (related.length >= 3 ? related : fallbackRelated).slice(0, 4);

  const tabs = [
    {
      value: 'desc',
      label: '商品描述',
      content: (
        <p style={{ margin: 0, lineHeight: 1.8, color: 'var(--ms-color-fg-muted)' }}>
          {product.description}
        </p>
      ),
    },
    {
      value: 'flavor',
      label: '风味档案',
      content: (
        <div style={{ display: 'grid', gap: '0.9rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {product.flavors.map((f) => (
              <Tag key={f} variant="soft" tone="accent">
                {f}
              </Tag>
            ))}
          </div>
          {product.roast && (
            <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
              烘焙度:{ROAST_LABEL[product.roast]}
              {product.origin ? ` · 产地:${product.origin}` : ''}
            </p>
          )}
        </div>
      ),
    },
    {
      value: 'brew',
      label: '冲煮建议',
      content: (
        <ul style={{ margin: 0, paddingInlineStart: '1.1rem', display: 'grid', gap: '0.6rem' }}>
          {BREW_TIPS.map((t) => (
            <li key={t} style={{ lineHeight: 1.7, color: 'var(--ms-color-fg-muted)' }}>
              {t}
            </li>
          ))}
        </ul>
      ),
    },
    {
      value: 'reviews',
      label: `评价 (${product.reviewCount})`,
      content: (
        <div style={{ display: 'grid', gap: '1.1rem' }}>
          {reviews.slice(0, 3).map((r) => (
            <div key={r.name} style={{ display: 'grid', gap: '0.35rem' }}>
              <Rate value={r.rating} readOnly size="sm" tone="warning" />
              <p style={{ margin: 0, lineHeight: 1.7 }}>{r.body}</p>
              <span style={{ fontSize: '0.82rem', color: 'var(--ms-color-fg-subtle)' }}>
                {r.name} · {r.date}
              </span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section className="db-section db-container">
      <Breadcrumb
        items={[
          { label: '首页', href: '#/' },
          { label: '全部商品', href: '#/shop' },
          { label: product.name, current: true },
        ]}
        onItemClick={(item, _i, event) => {
          if (item.href) {
            event.preventDefault();
            navigate(item.href.replace(/^#/, ''));
          }
        }}
        style={{ marginBlockEnd: '1.5rem' }}
      />

      <div className="db-product__grid">
        {/* 左:主视觉 + 风味标签 */}
        <div className="db-product__media">
          <ProductVisual product={product as Product} />
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBlockStart: '1.1rem',
            }}
          >
            {product.flavors.map((f) => (
              <Tag key={f} variant="soft" tone="accent" size="sm">
                {f}
              </Tag>
            ))}
          </div>
        </div>

        {/* 右:商品信息 */}
        <div style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Tag size="sm" variant="soft" tone="neutral">
              {product.subtitle}
            </Tag>
            {product.badge && (
              <Tag size="sm" variant="soft" tone="primary">
                {product.badge}
              </Tag>
            )}
          </div>

          <h1 className="db-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', margin: 0 }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Rate value={product.rating} readOnly allowHalf size="sm" tone="warning" />
            <span style={{ fontSize: '0.85rem', color: 'var(--ms-color-fg-subtle)' }}>
              {product.rating} · {product.reviewCount} 条评价
            </span>
          </div>

          <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', lineHeight: 1.7 }}>
            {product.blurb}
          </p>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span className="db-price" style={{ fontSize: '1.8rem' }}>
              {formatPrice(unit)}
            </span>
            {product.compareAt && isBean && weight === '250' && (
              <span className="db-price__was">{formatPrice(product.compareAt)}</span>
            )}
          </div>

          {isBean && (
            <div style={{ display: 'grid', gap: '0.9rem', marginBlockStart: '0.25rem' }}>
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>规格</span>
                <Segmented
                  value={weight}
                  onValueChange={setWeight}
                  options={weightOptions}
                  size="sm"
                />
              </div>
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>
                  研磨度
                </span>
                <Select
                  value={grind}
                  onChange={(value) => setGrind(value as string)}
                  options={grindOptions}
                  size="sm"
                  style={{ maxInlineSize: '16rem' }}
                />
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              marginBlockStart: '0.25rem',
            }}
          >
            <NumberInput
              value={qty}
              onValueChange={(v) => setQty(v ?? 1)}
              min={1}
              max={99}
              style={{ inlineSize: '8rem' }}
            />
            <Button variant="soft" onClick={() => add()}>
              加入购物车
            </Button>
            <Button onClick={() => add(() => navigate('/checkout'))}>立即购买</Button>
          </div>
        </div>
      </div>

      <div style={{ marginBlockStart: '2.5rem', maxInlineSize: '52rem' }}>
        <Tabs items={tabs} defaultValue="desc" />
      </div>

      <div style={{ marginBlockStart: '3.5rem' }}>
        <Reveal
          as="h2"
          variant="mask-up"
          className="db-display"
          style={{ fontSize: '1.5rem', marginBlockEnd: '1.25rem' }}
        >
          你可能也喜欢
        </Reveal>
        {/* 推荐位:zoom-in 错峰,和站内产品网格统一节奏 */}
        <RevealGroup variant="zoom-in" stagger={70} className="db-grid db-grid--products">
          {recommend.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
