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
  Stack,
  Tabs,
  Tag,
  type TagTone,
  Tooltip,
  toast,
} from '@magic-scope/react';
import { type CSSProperties, useState } from 'react';
import { ProductVisual, type VisualAspect } from '../components/ProductVisual';
import { categories, featuredProducts, getProduct, products } from '../data/products';
import type { CategoryId, Product, ProductBadge } from '../data/types';
import { formatDate, money } from '../lib/format';
import { navigate, RouterLink } from '../lib/router';
import { useCart } from '../lib/store';
import './ProductDetail.css';

/* ============================================================================
 * ProductDetail —— 商品详情页(Chromatic Grid 版式)。
 *
 * 骨架是拼贴,不是章节:
 *   ① 顶栏(面包屑 + 徽标),② 不等分主区 1.15fr / 1fr —— 左「白色展台」承载唯一的
 *   大色场,右列上白块是信息塔(发丝线把决策信息压成一列密集清单)、下墨块用超大评分
 *   数字压底;③ 事实带 1.72fr/1fr/1fr,首块是品类满色块(可点进该品类);
 *   ④ 全宽白块内的 Tabs;⑤ 推荐位 5 列,首卡横向跨 2 列。
 * 色彩即信息:品类色由 data-cat 注入(色条 / 圆点 / 满色块),不做纯装饰的点缀色。
 * 进场编排:左视觉 up,右信息列 stagger,其余滚动进视口逐块,时长统一 620ms。
 * ========================================================================== */

/* 三种裁切:缩略图本身就是对应比例的 AspectRatio,点击把主视觉切到该 aspect。
   grow = 宽高比 —— 缩略行按比例分宽,三块高度因此完全相等而宽度各不相同。 */
const CROPS: ReadonlyArray<{
  aspect: VisualAspect;
  ratio: string;
  grow: number;
  code: string;
  label: string;
}> = [
  { aspect: 'portrait', ratio: '4 / 5', grow: 0.8, code: '4 : 5', label: 'Portrait view' },
  { aspect: 'square', ratio: '1 / 1', grow: 1, code: '1 : 1', label: 'Square view' },
  { aspect: 'wide', ratio: '8 / 5', grow: 1.6, code: '8 : 5', label: 'Wide view' },
];

/* 徽标文案与色调(与列表页同一套映射)。 */
const BADGE_META: Record<ProductBadge, { label: string; tone: TagTone }> = {
  new: { label: 'New', tone: 'accent' },
  bestseller: { label: 'Bestseller', tone: 'neutral' },
  limited: { label: 'Limited', tone: 'warning' },
};

/* 产地(mock 数据未含,按品类补合理值)。拆成结构化字段:
   事实带用 city / country,规格表拼回整句,避免两处各写一份。 */
const ORIGIN_BY_CATEGORY: Record<CategoryId, { verb: string; city: string; country: string }> = {
  ceramics: { verb: 'Thrown', city: 'Porto', country: 'Portugal' },
  lighting: { verb: 'Assembled', city: 'Copenhagen', country: 'Denmark' },
  textiles: { verb: 'Woven', city: 'Guimarães', country: 'Portugal' },
  objects: { verb: 'Machined', city: 'Kanazawa', country: 'Japan' },
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

const labelOfCategory = (id: CategoryId): string =>
  categories.find((c) => c.id === id)?.label ?? 'Collection';

/* 延迟统一乘全局动效乘子:动效「弱/关」时延迟同步缩短/归零,不留呆等。 */
const dly = (value: number) => `calc(${value}ms * var(--ms-motion-scale, 1))`;

export function ProductDetail({ id }: { id: string }) {
  const product = getProduct(id);

  /* 无效 id:404 Result + 返回集合页。 */
  if (!product) {
    return (
      <div className="pd-notfound">
        <div className="sf-container">
          <Result
            status="404"
            title="Page not found"
            subtitle="We couldn't find that piece — it may have sold through, or the link has changed."
            extra={<Button onClick={() => navigate('/products')}>Back to collection</Button>}
          />
        </div>
      </div>
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
  const category = categories.find((c) => c.id === product.category);
  const categoryLabel = category?.label ?? 'Collection';
  const categoryBlurb = category?.blurb ?? '';
  const categoryCount = products.filter((p) => p.category === product.category).length;
  const origin = ORIGIN_BY_CATEGORY[product.category];
  const activeCrop = CROPS.find((c) => c.aspect === aspect);
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
    {
      key: 'origin',
      label: 'Origin',
      value: `${origin.verb} in ${origin.city}, ${origin.country}`,
    },
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
  const badges = product.badges ?? [];

  return (
    <div className="pd" data-cat={product.category}>
      <div className="sf-container">
        {/* ============================ 顶栏 ============================ */}
        <Reveal variant="fade" trigger="mount" duration={500}>
          <Stack
            className="pd-topbar"
            direction="horizontal"
            align="center"
            justify="between"
            gap={4}
            wrap="wrap"
          >
            <Breadcrumb
              className="pd-breadcrumb"
              items={[
                { label: 'Home', href: '#/' },
                { label: categoryLabel, href: `#/products?category=${product.category}` },
                { label: product.name },
              ]}
            />
            {badges.length > 0 && (
              <Stack className="pd-topbar-tags" direction="horizontal" align="center" gap={2}>
                {badges.map((badge) => (
                  <Tag key={badge} size="sm" variant="soft" tone={BADGE_META[badge].tone}>
                    {BADGE_META[badge].label}
                  </Tag>
                ))}
              </Stack>
            )}
          </Stack>
        </Reveal>

        {/* ====================== 主区:展台 / 信息塔 ====================== */}
        <div className="pd-main">
          {/* 左:白色展台(唯一的大色场)+ 一行等高、按比例分宽的裁切缩略 */}
          <Reveal variant="up" trigger="mount" className="pd-gallery">
            <div className="sf-tile pd-stage">
              <Stack
                className="pd-stage-head"
                direction="horizontal"
                align="center"
                justify="between"
                gap={3}
              >
                <span className="sf-kicker">
                  <i className="sf-dot sf-cat-dot" aria-hidden="true" />
                  {categoryLabel}
                </span>
                <span className="sf-index">{activeCrop?.code}</span>
              </Stack>
              <ProductVisual product={product} aspect={aspect} className="pd-stage-visual" />
            </div>
            {/* 每个缩略按钮自带 aria-label,无需容器 role */}
            <div className="pd-thumbs">
              {CROPS.map((crop) => (
                <button
                  key={crop.aspect}
                  type="button"
                  className="pd-thumb"
                  style={{ flexGrow: crop.grow }}
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

          {/* 右:信息塔(白块)+ 评分墨块,逐块 stagger 进场;段与段之间只有发丝线 */}
          <div className="pd-column">
            <RevealGroup className="sf-tile pd-info" trigger="mount" variant="up" stagger={70}>
              <div className="pd-head">
                <span className="pd-catbar" aria-hidden="true" />
                <h1 className="sf-display sf-display-lg pd-title">{product.name}</h1>
                <p className="pd-tagline">{product.tagline}</p>
              </div>

              <Stack
                className="pd-rating"
                direction="horizontal"
                align="center"
                gap={2}
                wrap="wrap"
              >
                <Rate
                  value={product.rating}
                  allowHalf
                  readOnly
                  size="sm"
                  aria-label={`Rated ${product.rating} out of 5`}
                />
                <span className="pd-rating-score">{product.rating.toFixed(1)}</span>
                <span className="sf-index">{product.reviews} REVIEWS</span>
              </Stack>

              <hr className="sf-hairline" />

              <Stack
                className="pd-price-row"
                direction="horizontal"
                align="baseline"
                gap={3}
                wrap="wrap"
              >
                <span className="pd-price">{money(product.price)}</span>
                {product.compareAt != null && (
                  <>
                    <span className="sf-price-compare pd-compare">{money(product.compareAt)}</span>
                    <Tag tone="accent" size="sm">
                      Save {money(product.compareAt - product.price)}
                    </Tag>
                  </>
                )}
              </Stack>

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

              <Stack className="pd-buy" direction="horizontal" align="stretch" gap={2}>
                <NumberInput
                  size="lg"
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
                <Button size="lg" shape="pill" glow="off" className="pd-add" onClick={handleAdd}>
                  Add to cart · {money(product.price * qty)}
                </Button>
              </Stack>

              <Stack className="pd-meta" direction="horizontal" align="center" gap={3} wrap="wrap">
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
              </Stack>

              <hr className="sf-hairline" />

              <Accordion
                className="pd-accordion"
                classNames={{
                  item: 'pd-acc-item',
                  trigger: 'pd-acc-trigger',
                  panel: 'pd-acc-panel',
                }}
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

            {/* 评分墨块:超大数字压住信息塔底部,右侧接一列密集小字 */}
            <Reveal variant="up" trigger="mount" delay={dly(560)} asChild>
              <div className="sf-tile sf-tile-ink pd-score">
                <Stack
                  className="pd-score-row"
                  direction="horizontal"
                  align="end"
                  justify="between"
                  gap={4}
                  wrap="wrap"
                >
                  <div>
                    <p className="sf-kicker">Average rating</p>
                    <p className="sf-numeral pd-score-num">{product.rating.toFixed(1)}</p>
                  </div>
                  <div className="pd-score-side">
                    <Rate
                      value={product.rating}
                      allowHalf
                      readOnly
                      size="sm"
                      aria-label={`Average rating ${product.rating} out of 5`}
                    />
                    <p className="sf-index pd-score-count">{product.reviews} VERIFIED REVIEWS</p>
                    <p className="pd-score-note">Inspected by hand before it ships.</p>
                  </div>
                </Stack>
                <span className="sf-spectrum pd-score-spectrum" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </Reveal>
          </div>
        </div>

        {/* =============== 事实带:1.72 / 1 / 1,首块是品类满色块 =============== */}
        <RevealGroup className="pd-facts" variant="up" stagger={70} margin="0px 0px -8% 0px">
          <RouterLink
            to={`/products?category=${product.category}`}
            className="sf-tile sf-cat-fill sf-lift pd-fact pd-fact-cat"
          >
            <p className="sf-kicker">More from</p>
            <p className="sf-display sf-display-md pd-fact-value">{categoryLabel}</p>
            <p className="pd-fact-blurb">{categoryBlurb}</p>
            <p className="pd-fact-note">{categoryCount} pieces →</p>
          </RouterLink>
          <div className="sf-tile pd-fact">
            <p className="sf-kicker">Made in</p>
            <p className="sf-display sf-display-md pd-fact-value">{origin.city}</p>
            <p className="pd-fact-note">
              {origin.verb} by hand in {origin.country}
            </p>
          </div>
          <div className="sf-tile pd-fact">
            <p className="sf-kicker">Dispatch</p>
            <p className="sf-display sf-display-md pd-fact-value">48h</p>
            <p className="pd-fact-note">Carbon-neutral carriers, 30-day returns</p>
          </div>
        </RevealGroup>

        {/* ===================== 全宽白块:三个内容 Tab ==================== */}
        <Reveal variant="fade" trigger="view" className="pd-below">
          <div className="sf-tile pd-tabs-tile">
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
                      <div>
                        <p className="pd-desc">{product.description}</p>
                        <p className="sf-index pd-desc-sign">
                          ARDEN STUDIO — {categoryLabel.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ),
                },
                {
                  value: 'specs',
                  label: 'Specifications',
                  content: (
                    // 行的装箱按 base 列数在 JS 里算:给断点对象会让每行只装一项,故固定两列
                    <Descriptions className="pd-specs" bordered columns={2} items={specItems} />
                  ),
                },
                {
                  value: 'reviews',
                  label: 'Reviews',
                  badge: <span>{product.reviews}</span>,
                  content: (
                    <div className="pd-reviews">
                      <Stack
                        className="pd-review-summary"
                        direction="horizontal"
                        align="center"
                        gap={4}
                        wrap="wrap"
                      >
                        <span className="pd-review-score">{product.rating.toFixed(1)}</span>
                        <div>
                          <Rate
                            value={product.rating}
                            allowHalf
                            readOnly
                            size="sm"
                            aria-label={`Average rating ${product.rating} out of 5`}
                          />
                          <p className="pd-review-summary-note">
                            Based on {product.reviews} reviews
                          </p>
                        </div>
                      </Stack>
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
                                <span className="sf-index pd-review-date">
                                  {formatDate(review.date)}
                                </span>
                              </div>
                              <p className="pd-review-text">{review.text}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Reveal>

        {/* ========================== 同类推荐 =========================== */}
        {suggestions.length > 0 && (
          <section className="pd-related" aria-labelledby="pd-related-title">
            <Reveal variant="up" trigger="view">
              <Stack
                className="pd-related-head"
                direction="horizontal"
                align="end"
                justify="between"
                gap={6}
                wrap="wrap"
              >
                <div>
                  <p className="sf-kicker sf-kicker-dot">Keep looking</p>
                  <h2 id="pd-related-title" className="sf-display sf-display-lg pd-related-title">
                    You may also like
                  </h2>
                </div>
                <RouterLink to="/products" className="pd-related-all">
                  Shop all →
                </RouterLink>
              </Stack>
            </Reveal>
            {/* 5 列网格:首卡横向跨 2 列打破等分,其余三张纵向卡各占 1 列 */}
            <RevealGroup className="pd-related-grid" variant="up" stagger={80}>
              {suggestions.map((p, i) => (
                <RouterLink
                  key={p.id}
                  to={`/products/${p.id}`}
                  data-cat={p.category}
                  className={i === 0 ? 'sf-product-card sf-product-card-wide' : 'sf-product-card'}
                >
                  <ProductVisual product={p} aspect="portrait" />
                  <div className="sf-product-meta">
                    <div className="sf-product-tagrow">
                      <i className="sf-dot sf-cat-dot" aria-hidden="true" />
                      <span className="sf-product-cat">{labelOfCategory(p.category)}</span>
                    </div>
                    <div className="sf-product-name">{p.name}</div>
                    <div className="sf-product-row">
                      <small>{p.tagline}</small>
                      <span className="sf-product-price">
                        {p.compareAt != null && (
                          <span className="sf-price-compare">{money(p.compareAt)}</span>
                        )}
                        {money(p.price)}
                      </span>
                    </div>
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
