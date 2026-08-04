import {
  Button,
  Carousel,
  FloatButton,
  Popover,
  Reveal,
  RevealGroup,
  Tag,
  type TagTone,
} from '@magic-scope/react';
import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { ProductVisual, type VisualAspect } from '../components/ProductVisual';
import { categories, featuredProducts, products } from '../data/products';
import type { Product, ProductBadge } from '../data/types';
import { money } from '../lib/format';
import { RouterLink } from '../lib/router';
import './Home.css';

/* ============================================================================
 * Home —— 买家首页(全站门面)。
 * 编排:Hero 进场(mount)→ 分类带 / 精选 / 宣言带滚动 reveal(view + stagger)
 * → Back in stock 轮播 → 收尾陈述带;右下角常驻 FloatButton + Popover 聊天入口。
 * 动效克制:距离 ≤ 22px、时长 500~700ms,全部经 --ms-motion-scale 门控。
 * ========================================================================== */

/* 延迟统一乘全局动效乘子:动效「弱/关」时延迟同步缩短/归零,不留呆等。 */
const dly = (value: number) => `calc(${value}ms * var(--ms-motion-scale, 1))`;

/* 徽标文案与色调:克制映射,不做大红大绿。 */
const BADGE_META: Record<ProductBadge, { label: string; tone: TagTone }> = {
  new: { label: 'New', tone: 'accent' },
  bestseller: { label: 'Bestseller', tone: 'neutral' },
  limited: { label: 'Limited', tone: 'warning' },
};

/* Hero collage 两件主角(featured 数据里取,缺失时该块自动不渲染)。 */
const HERO_MAIN = products.find((p) => p.id === 'halo-lamp');
const HERO_SIDE = products.find((p) => p.id === 'arc-bookend');

/* 精选 4 款 + 轮播 6 款非精选(静态目录,模块级算一次)。 */
const EDIT_PICKS = featuredProducts.slice(0, 4);
const RESTOCK = products.filter((p) => !p.featured).slice(0, 6);

/* 分类卡:用该分类第一款商品的色场做低饱和底。 */
const CATEGORY_CARDS = categories.flatMap((category) => {
  const rep = products.find((p) => p.category === category.id);
  if (!rep) return [];
  const count = products.filter((p) => p.category === category.id).length;
  return [{ category, rep, count }];
});

function chunk<T>(list: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/* ------------------------------ 行内线性图标 ------------------------------ */
/* 15px / stroke 1.2,与 SiteHeader 的图标同一套笔触语言。 */

const BatchIcon = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <ellipse cx="7.5" cy="4.7" rx="5" ry="2.4" stroke="currentColor" strokeWidth="1.2" />
    <path
      d="M2.5 7.5c0 1.33 2.24 2.4 5 2.4s5-1.07 5-2.4M2.5 10.2c0 1.33 2.24 2.4 5 2.4s5-1.07 5-2.4"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const LeafIcon = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M12.2 2.5c-5.5.3-8.7 3-8.7 6.7 0 1.8 1.3 3 3 3 3.7 0 6.2-3.3 6.5-8.8a.8.8 0 0 0-.8-.9Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="M4.1 11.5c1.8-2.8 3.9-5 6.4-6.7"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const RepairIcon = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M12.2 7.5a4.7 4.7 0 1 1-1.5-3.45"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M12.5 2.4v2.3h-2.3"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChatIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M13.6 7.8a5.6 5.6 0 0 1-8.1 5L2.5 13.6l.85-2.7A5.6 5.6 0 1 1 13.6 7.8Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path d="M5.5 6.9h5M5.5 9h3.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/* ------------------------------- 商品卡片 -------------------------------- */

/**
 * 商品卡 —— 视觉 + 徽标 + 名称/一句话/价格。
 * 透传 ...rest:RevealGroup 会经 cloneElement 注入 data-ms-reveal / style(--i),
 * 必须一路落到 <a> 上,滚动 reveal 才生效。
 */
function ProductCard({
  product,
  aspect = 'portrait',
  ...rest
}: { product: Product; aspect?: VisualAspect } & Omit<ComponentPropsWithoutRef<'a'>, 'href'>) {
  return (
    <RouterLink to={`/products/${product.id}`} className="sf-product-card home-card" {...rest}>
      <div className="home-card-media">
        {product.badges && product.badges.length > 0 && (
          <div className="home-card-badges">
            {product.badges.map((badge) => (
              <Tag key={badge} size="sm" variant="soft" tone={BADGE_META[badge].tone}>
                {BADGE_META[badge].label}
              </Tag>
            ))}
          </div>
        )}
        <ProductVisual product={product} aspect={aspect} />
      </div>
      <div className="sf-product-meta">
        <div>
          <div className="sf-product-name">{product.name}</div>
          <div className="sf-product-tagline">{product.tagline}</div>
        </div>
        <div className="sf-product-price">
          {product.compareAt != null && (
            <span className="sf-price-compare">{money(product.compareAt)}</span>
          )}
          {money(product.price)}
        </div>
      </div>
    </RouterLink>
  );
}

/* --------------------------------- 页面 ---------------------------------- */

export function Home() {
  /* hash 路由下 href="#approach" 会被当成路由切换(还会被滚回顶部),
   * 页内锚点只能走 scrollIntoView;不传 behavior,交给 CSS scroll-behavior
   * (smooth,reduced-motion 时自动 auto)。 */
  const scrollToApproach = () => {
    document.getElementById('approach')?.scrollIntoView();
  };

  return (
    <div className="home">
      {/* ============================ 1 · Hero ============================ */}
      <section className="sf-section home-hero">
        <div className="sf-container home-hero-grid">
          <div className="home-hero-copy">
            <Reveal trigger="mount" variant="fade" asChild>
              <p className="sf-eyebrow">Home objects studio</p>
            </Reveal>
            <Reveal
              trigger="mount"
              variant="text-lines"
              as="h1"
              className="sf-display sf-display-xl home-hero-title"
              delay={dly(90)}
              stagger={120}
            >
              {'Objects for the\nhours at home.'}
            </Reveal>
            <Reveal trigger="mount" variant="up" distance={16} delay={dly(340)} asChild>
              <p className="sf-lede home-hero-lede">
                Ceramics, lighting and textiles — designed in-house, made slowly, kept for years.
              </p>
            </Reveal>
            <Reveal trigger="mount" variant="up" distance={14} delay={dly(460)} asChild>
              <div className="home-hero-cta">
                <Button asChild size="lg">
                  <RouterLink to="/products">Shop the collection</RouterLink>
                </Button>
                <button type="button" className="sf-link home-link-btn" onClick={scrollToApproach}>
                  Our approach
                </button>
              </div>
            </Reveal>
          </div>

          {/* collage:大 portrait 压底,小 square 负 margin 叠上来 */}
          <div className="home-hero-art">
            {HERO_MAIN && (
              <Reveal trigger="mount" variant="up" distance={22} delay={dly(240)} asChild>
                <RouterLink
                  to={`/products/${HERO_MAIN.id}`}
                  className="home-hero-main"
                  aria-label={`${HERO_MAIN.name} — view product`}
                >
                  <ProductVisual product={HERO_MAIN} aspect="portrait" />
                </RouterLink>
              </Reveal>
            )}
            {HERO_SIDE && (
              <Reveal trigger="mount" variant="up" distance={18} delay={dly(440)} asChild>
                <RouterLink
                  to={`/products/${HERO_SIDE.id}`}
                  className="home-hero-side"
                  aria-label={`${HERO_SIDE.name} — view product`}
                >
                  <ProductVisual product={HERO_SIDE} aspect="square" />
                </RouterLink>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* =========================== 2 · 分类带 =========================== */}
      <section className="sf-section-tight">
        <RevealGroup
          className="sf-container home-cats"
          variant="up"
          stagger={70}
          margin="0px 0px -10% 0px"
        >
          {/* reveal 注入落在包装 div 上:.home-cat 自己的 hover transition
              简写会覆盖 reveal 过渡(同特异性、页面 CSS 后加载),必须解耦 */}
          {CATEGORY_CARDS.map(({ category, rep, count }) => (
            <div key={category.id}>
              <RouterLink
                to={`/products?category=${category.id}`}
                className="home-cat"
                style={
                  {
                    '--hc-field': rep.visual.field,
                    '--hc-tint': rep.visual.tint,
                    '--hc-shade': rep.visual.shade,
                  } as CSSProperties
                }
              >
                <span className="home-cat-name">{category.label}</span>
                <span className="home-cat-count">
                  {count} {count === 1 ? 'piece' : 'pieces'}
                </span>
              </RouterLink>
            </div>
          ))}
        </RevealGroup>
      </section>

      <div className="sf-container">
        <hr className="sf-hairline" />
      </div>

      {/* =========================== 3 · The edit ========================== */}
      <section className="sf-section">
        <div className="sf-container">
          <Reveal variant="up" distance={16} asChild>
            <div className="home-section-head">
              <div>
                <p className="sf-eyebrow">The edit</p>
                <h2 className="sf-display sf-display-lg">The pieces we reach for.</h2>
              </div>
              <RouterLink to="/products" className="sf-link home-head-link">
                View all
              </RouterLink>
            </div>
          </Reveal>
          <RevealGroup className="home-grid-4" variant="up" stagger={80}>
            {EDIT_PICKS.map((product) => (
              <ProductCard key={product.id} product={product} aspect="portrait" />
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ========================= 4 · 工作室宣言带 ========================= */}
      <section id="approach" className="sf-section-tight">
        <div className="sf-container">
          <div className="home-approach">
            <Reveal variant="fade" asChild>
              <p className="sf-eyebrow">Our approach</p>
            </Reveal>
            {/* mask-up 默认渲染 div,heading 里只能放 phrasing 内容,故 as="span" + CSS 转块级 */}
            <h2 className="sf-display sf-display-lg home-approach-title">
              <Reveal variant="mask-up" as="span" className="home-approach-line">
                Fewer, better objects.
              </Reveal>
              <Reveal variant="mask-up" as="span" delay={dly(140)} className="home-approach-line">
                Kept for years, not seasons.
              </Reveal>
            </h2>
            <RevealGroup className="home-values" variant="up" stagger={90}>
              <div className="home-value">
                <span className="home-value-icon">{BatchIcon}</span>
                <h3 className="home-value-title">Small batches</h3>
                <p className="home-value-copy">
                  Each run is thrown, glazed and finished by the same pair of hands.
                </p>
              </div>
              <div className="home-value">
                <span className="home-value-icon">{LeafIcon}</span>
                <h3 className="home-value-title">Natural materials</h3>
                <p className="home-value-copy">
                  Stoneware, linen, brass and oak — nothing that pretends to be something else.
                </p>
              </div>
              <div className="home-value">
                <span className="home-value-icon">{RepairIcon}</span>
                <h3 className="home-value-title">Repairs for life</h3>
                <p className="home-value-copy">
                  If a piece breaks, we mend it. Every object carries a lifetime repair promise.
                </p>
              </div>
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* ======================== 5 · Back in stock ======================== */}
      <section className="sf-section home-restock">
        <div className="sf-container">
          <Reveal variant="up" distance={16} asChild>
            <div className="home-section-head">
              <div>
                <p className="sf-eyebrow">Restocked this week</p>
                <h2 className="sf-display sf-display-lg">Back in stock.</h2>
              </div>
            </div>
          </Reveal>
          {/* 库 Carousel 按整屏翻页(slide = 一屏),所以 6 款按 3 张/屏分组成
              2 屏横滑;箭头翻页 + 指针拖拽,不自动播,dots 关掉免遮商品文字。 */}
          <Reveal variant="fade" delay={dly(120)}>
            <Carousel
              aria-label="Back in stock"
              tone="neutral"
              loop={false}
              dots={false}
              autoplay={false}
            >
              {chunk(RESTOCK, 3).map((row) => (
                <div key={row.map((p) => p.id).join('-')} className="home-restock-row">
                  {row.map((product) => (
                    <ProductCard key={product.id} product={product} aspect="square" />
                  ))}
                </div>
              ))}
            </Carousel>
          </Reveal>
        </div>
      </section>

      {/* ========================= 6 · 收尾陈述带 ========================= */}
      <section className="sf-section-tight home-visit">
        <Reveal variant="fade" className="sf-container home-visit-inner">
          <p className="sf-eyebrow">Visit</p>
          <h2 className="sf-display sf-display-md">The studio is open, Thursdays.</h2>
          <p className="home-visit-address">14 Arden Mews, East London — 10:00 to 18:00.</p>
          <a className="sf-link home-visit-link" href="mailto:hello@arden.studio">
            Plan a visit
          </a>
        </Reveal>
      </section>

      {/* ================== 7 · 右下角聊天入口(全局浮钮) ================== */}
      {/* 单个 FloatButton 自身不带固定定位(库约定),用页面级 fixed 容器落位。 */}
      <div className="home-chat">
        <Popover
          trigger={<FloatButton icon={ChatIcon} aria-label="Message the studio" />}
          placement="top-end"
          offset={12}
        >
          <div className="home-chat-card">
            <strong className="home-chat-title">We reply within a day.</strong>
            <p className="home-chat-copy">Questions about a piece or an order — write anytime.</p>
            <a className="sf-link home-chat-mail" href="mailto:hello@arden.studio">
              hello@arden.studio
            </a>
          </div>
        </Popover>
      </div>
    </div>
  );
}
