import {
  Accordion,
  AspectRatio,
  Avatar,
  Breadcrumb,
  Button,
  CopyButton,
  Descriptions,
  type DescriptionsItem,
  NumberInput,
  Rate,
  Result,
  Reveal,
  RevealGroup,
  Tabs,
  Tag,
  Tooltip,
  toast,
} from '@magic-scope/react';
import { type CSSProperties, useState } from 'react';
import { ProductVisual, type VisualAspect } from '../components/ProductVisual';
import { categories, featuredProducts, getProduct, products } from '../data/products';
import type { CategoryId, Product } from '../data/types';
import { formatDate, money } from '../lib/format';
import { navigate, RouterLink } from '../lib/router';
import { useCart } from '../lib/store';
import './ProductDetail.css';

/* ============================================================================
 * ProductDetail —— 商品详情页。
 * 左:主视觉 + 三种裁切缩略(AspectRatio 真实驱动主图 aspect 切换);
 * 右:名称 / 评分 / 价格 / 色板 / 数量加购 / 库存与运费 / 分享 / Accordion;
 * 下:Description · Specifications · Reviews 三个 Tab + 同类推荐四卡。
 * 进场编排:左视觉 Reveal up,右信息列 RevealGroup 逐块 stagger(克制)。
 * ========================================================================== */

/* 三种裁切:缩略图本身就是对应比例的 AspectRatio,点击把主视觉切到该 aspect。 */
const CROPS: ReadonlyArray<{ aspect: VisualAspect; ratio: string; label: string }> = [
  { aspect: 'portrait', ratio: '4 / 5', label: 'Portrait view' },
  { aspect: 'square', ratio: '1 / 1', label: 'Square view' },
  { aspect: 'wide', ratio: '8 / 5', label: 'Wide view' },
];

/* 规格表补充的静态产地(mock 数据未含,按品类补合理值)。 */
const ORIGIN_BY_CATEGORY: Record<CategoryId, string> = {
  ceramics: 'Thrown in Porto, Portugal',
  lighting: 'Assembled in Copenhagen, Denmark',
  textiles: 'Woven in Guimarães, Portugal',
  objects: 'Machined in Kanazawa, Japan',
};

/* 规格表补充的静态重量(按款,mock 合理值)。 */
const WEIGHT_BY_ID: Record<string, string> = {
  'duna-vase': '1.6 kg',
  'meno-carafe': '0.9 kg',
  'orbe-bowls': '2.4 kg (set of four)',
  'halo-lamp': '3.2 kg',
  'ledge-sconce': '1.1 kg',
  'mica-floor-lamp': '4.8 kg',
  'field-throw': '1.9 kg',
  'grain-cushion': '0.8 kg',
  'strata-runner': '0.6 kg',
  'arc-bookend': '1.4 kg',
  'pausa-tray': '0.5 kg',
  'node-candleholder': '0.7 kg',
};

/* 手写静态评论(日期为固定 mock,经 format.ts 统一格式化)。 */
const REVIEWS: ReadonlyArray<{ name: string; rating: number; date: string; text: string }> = [
  {
    name: 'Margot Ellison',
    rating: 5,
    date: '2026-06-12',
    text: 'Exactly as pictured, and somehow better in the hand. The finish is soft and even, and it has quietly become the piece guests ask about.',
  },
  {
    name: 'Daniel Reyes',
    rating: 4.5,
    date: '2026-04-28',
    text: 'Substantial, carefully packed, quick to arrive. You can tell it was made by people who handle the thing before they ship it.',
  },
  {
    name: 'Ines Keller',
    rating: 4,
    date: '2026-02-19',
    text: 'Beautiful proportions and an honest material. The colour runs a touch warmer than the photos, which I happen to like.',
  },
];

export function ProductDetail({ id }: { id: string }) {
  const product = getProduct(id);

  /* 无效 id:404 Result + 返回集合页。 */
  if (!product) {
    return (
      <section className="sf-section pd-notfound">
        <div className="sf-container">
          <Result
            status="404"
            title="Page not found"
            subtitle="We couldn't find that piece — it may have sold through, or the link has changed."
            extra={<Button onClick={() => navigate('/products')}>Back to collection</Button>}
          />
        </div>
      </section>
    );
  }

  /* key=商品 id:从推荐位跳到另一款时,重置裁切/色板/数量等本地态。 */
  return <ProductDetailView key={product.id} product={product} />;
}

function ProductDetailView({ product }: { product: Product }) {
  const { add, openDrawer } = useCart();
  const [aspect, setAspect] = useState<VisualAspect>('portrait');
  const [colorwayId, setColorwayId] = useState(product.colorways[0]?.id ?? '');
  const [qty, setQty] = useState(1);

  const colorway = product.colorways.find((c) => c.id === colorwayId);
  const categoryLabel = categories.find((c) => c.id === product.category)?.label ?? 'Collection';
  const shareUrl = `${window.location.origin}${window.location.pathname}#/products/${product.id}`;

  /* 加购:写入 store 并 toast(带「View cart」直达抽屉)。 */
  const handleAdd = () => {
    if (!colorway) return;
    add(product.id, colorway.id, qty);
    toast.success('Added to cart', {
      description: `${product.name} · ${colorway.label} × ${qty}`,
      action: { label: 'View cart', onClick: openDrawer },
    });
  };

  /* 规格表:材质/尺寸从 details 拆,重量/产地/色板/养护补齐。 */
  const specItems: DescriptionsItem[] = [
    { key: 'material', label: 'Material', value: product.details[0] ?? '—' },
    { key: 'dimensions', label: 'Dimensions', value: product.details[1] ?? '—' },
    { key: 'weight', label: 'Weight', value: WEIGHT_BY_ID[product.id] ?? '—' },
    { key: 'origin', label: 'Origin', value: ORIGIN_BY_CATEGORY[product.category] },
    {
      key: 'colorways',
      label: 'Colorways',
      value: product.colorways.map((c) => c.label).join(' · '),
    },
    { key: 'care', label: 'Care', value: product.care[0] ?? '—' },
  ];

  /* 同类其它商品,不足四张用精选补位。 */
  const related = products.filter((p) => p.category === product.category && p.id !== product.id);
  const fillers = featuredProducts.filter(
    (p) => p.id !== product.id && !related.some((r) => r.id === p.id),
  );
  const suggestions = [...related, ...fillers].slice(0, 4);

  return (
    <div className="pd">
      <div className="sf-container">
        <Reveal variant="fade" trigger="mount" duration={500}>
          <Breadcrumb
            className="pd-breadcrumb"
            items={[
              { label: 'Home', href: '#/' },
              { label: categoryLabel, href: `#/products?category=${product.category}` },
              { label: product.name },
            ]}
          />
        </Reveal>

        <div className="pd-main">
          {/* 左:主视觉 + 三种裁切缩略 */}
          <Reveal variant="up" trigger="mount" className="pd-gallery">
            <ProductVisual product={product} aspect={aspect} />
            {/* 每个缩略按钮自带 aria-label,无需容器 role */}
            <div className="pd-thumbs">
              {CROPS.map((crop) => (
                <button
                  key={crop.aspect}
                  type="button"
                  className="pd-thumb"
                  aria-pressed={aspect === crop.aspect}
                  aria-label={crop.label}
                  onClick={() => setAspect(crop.aspect)}
                >
                  <AspectRatio ratio={crop.ratio} className="pd-thumb-frame" aria-hidden="true">
                    <ProductVisual product={product} />
                  </AspectRatio>
                </button>
              ))}
            </div>
          </Reveal>

          {/* 右:信息列,逐块 stagger 进场 */}
          <RevealGroup className="pd-info" trigger="mount" variant="up" stagger={70}>
            <div className="pd-head">
              <p className="sf-eyebrow">{categoryLabel}</p>
              <h1 className="sf-display sf-display-md pd-title">{product.name}</h1>
              <p className="pd-tagline">{product.tagline}</p>
            </div>

            <div className="pd-rating">
              <Rate
                value={product.rating}
                allowHalf
                readOnly
                size="sm"
                aria-label={`Rated ${product.rating} out of 5`}
              />
              <span className="pd-rating-note">
                {product.rating} · {product.reviews} reviews
              </span>
            </div>

            <div className="pd-price-row">
              <span className="pd-price">{money(product.price)}</span>
              {product.compareAt != null && (
                <>
                  <span className="sf-price-compare pd-compare">{money(product.compareAt)}</span>
                  <Tag tone="accent" size="sm">
                    Save {money(product.compareAt - product.price)}
                  </Tag>
                </>
              )}
            </div>

            <hr className="sf-hairline" />

            <div className="pd-colorway">
              <p className="pd-option-label">
                Colorway <span className="pd-option-value">{colorway?.label ?? '—'}</span>
              </p>
              {/* 圆点按钮各自带 aria-label/aria-pressed,标签行就在上方 */}
              <div className="pd-swatches">
                {product.colorways.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="pd-swatch"
                    style={{ '--swatch': c.swatch } as CSSProperties}
                    aria-pressed={c.id === colorwayId}
                    aria-label={c.label}
                    title={c.label}
                    onClick={() => setColorwayId(c.id)}
                  />
                ))}
              </div>
            </div>

            <div className="pd-buy">
              <NumberInput
                min={1}
                max={9}
                value={qty}
                onValueChange={(v) => {
                  /* 清空输入会上报 null:忽略,等失焦 clamp 后的有效值 */
                  if (v != null) setQty(v);
                }}
                aria-label="Quantity"
                className="pd-buy-qty"
              />
              <Button size="lg" className="pd-add" onClick={handleAdd}>
                Add to cart · {money(product.price * qty)}
              </Button>
            </div>

            <div className="pd-meta">
              {product.stock < 15 ? (
                <Tag tone="warning" size="sm">
                  Low stock — {product.stock} left
                </Tag>
              ) : null}
              <Tooltip content="Free over $150. Carbon-neutral carriers." placement="top" arrow>
                <span className="pd-shipnote">Free shipping over $150</span>
              </Tooltip>
              <CopyButton
                className="pd-share"
                value={shareUrl}
                variant="ghost"
                size="sm"
                withTooltip={false}
              >
                {(copied) => (copied ? 'Link copied' : 'Share')}
              </CopyButton>
            </div>

            <Accordion
              className="pd-accordion"
              type="single"
              tone="neutral"
              defaultValue="details"
              items={[
                {
                  value: 'details',
                  title: 'Details',
                  content: (
                    <ul className="pd-acc-list">
                      {product.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  ),
                },
                {
                  value: 'care',
                  title: 'Care',
                  content: (
                    <ul className="pd-acc-list">
                      {product.care.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  ),
                },
                {
                  value: 'shipping',
                  title: 'Shipping & returns',
                  content: (
                    <p className="pd-acc-copy">
                      Complimentary carbon-neutral shipping on orders over $150; most pieces
                      dispatch within 48 hours. Returns are accepted within 30 days in original
                      condition and packaging.
                    </p>
                  ),
                },
              ]}
            />
          </RevealGroup>
        </div>

        {/* 下方:三个内容 Tab */}
        <Reveal variant="fade" trigger="view" className="pd-below">
          <Tabs
            variant="underline"
            defaultValue="description"
            classNames={{ panel: 'pd-tab-panel' }}
            items={[
              {
                value: 'description',
                label: 'Description',
                content: (
                  <div className="pd-desc-wrap">
                    <p className="pd-desc-lead">{product.tagline}</p>
                    <p className="pd-desc">{product.description}</p>
                  </div>
                ),
              },
              {
                value: 'specs',
                label: 'Specifications',
                content: (
                  <Descriptions
                    className="pd-specs"
                    bordered
                    columns={{ base: 1, sm: 2 }}
                    items={specItems}
                  />
                ),
              },
              {
                value: 'reviews',
                label: 'Reviews',
                badge: <span>{product.reviews}</span>,
                content: (
                  <div className="pd-reviews">
                    <div className="pd-review-summary">
                      <span className="pd-review-score">{product.rating.toFixed(1)}</span>
                      <div>
                        <Rate
                          value={product.rating}
                          allowHalf
                          readOnly
                          size="sm"
                          aria-label={`Average rating ${product.rating} out of 5`}
                        />
                        <p className="pd-review-summary-note">Based on {product.reviews} reviews</p>
                      </div>
                    </div>
                    <ul className="pd-review-list">
                      {REVIEWS.map((review) => (
                        <li key={review.name} className="pd-review">
                          <Avatar name={review.name} size="sm" />
                          <div className="pd-review-body">
                            <div className="pd-review-head">
                              <span className="pd-review-name">{review.name}</span>
                              <Rate
                                value={review.rating}
                                allowHalf
                                readOnly
                                size="sm"
                                aria-label={`${review.name} rated ${review.rating} out of 5`}
                              />
                            </div>
                            <p className="pd-review-text">{review.text}</p>
                            <span className="pd-review-date">{formatDate(review.date)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              },
            ]}
          />
        </Reveal>

        {/* 同类推荐:四卡 stagger */}
        {suggestions.length > 0 && (
          <section className="pd-related" aria-labelledby="pd-related-title">
            <Reveal variant="up" trigger="view" className="pd-related-head">
              <div>
                <p className="sf-eyebrow">Keep looking</p>
                <h2 id="pd-related-title" className="sf-display sf-display-md pd-related-title">
                  You may also like
                </h2>
              </div>
              <RouterLink to="/products" className="sf-link pd-related-all">
                Shop all
              </RouterLink>
            </Reveal>
            <RevealGroup className="pd-related-grid" variant="up" stagger={80}>
              {suggestions.map((p) => (
                <RouterLink key={p.id} to={`/products/${p.id}`} className="sf-product-card">
                  <ProductVisual product={p} aspect="portrait" />
                  <div className="sf-product-meta">
                    <div>
                      <div className="sf-product-name">{p.name}</div>
                      <div className="sf-product-tagline">{p.tagline}</div>
                    </div>
                    <div className="sf-product-price">{money(p.price)}</div>
                  </div>
                </RouterLink>
              ))}
            </RevealGroup>
          </section>
        )}
      </div>
    </div>
  );
}
