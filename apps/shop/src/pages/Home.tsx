import {
  Button,
  Carousel,
  FloatButton,
  List,
  Popover,
  Reveal,
  RevealGroup,
  ScrollArea,
  Statistic,
  Tag,
  type TagTone,
} from '@magic-scope/react';
import type { ComponentPropsWithoutRef } from 'react';
import { ProductVisual } from '../components/ProductVisual';
import { categories, featuredProducts, products } from '../data/products';
import type { CategoryId, Product, ProductBadge } from '../data/types';
import { money } from '../lib/format';
import { RouterLink } from '../lib/router';
import './Home.css';

/* ============================================================================
 * Home —— 买家首页(全站门面),版式语言 = Chromatic Grid。
 *
 * 页面不是「标题 + 等分卡片」一节节堆下去,而是由**不等分色块拼贴**成的版面:
 *   1 首屏 bento(1.72fr / 1fr / 1fr,主色满色块压住左侧两行)
 *   2 品类带(1.25 / 1 / 1 / .85,四个品类色满色块)
 *   3 精选货架(4 列里混入 2×2 大卡与横向宽卡,打破等分)
 *   4 数字墙(左超大数字 · 右密集清单 —— 密度反差)
 *   5 满出血横滚(ScrollArea)
 * 色块承担结构(标题 / 大数字 / 品类识别),不是装饰;尺度上超大与 11px 并置。
 *
 * 动效:首屏 mount 编排,下方各区 view + stagger;距离 ≤18px、时长 600ms,
 * 全部经 --ms-motion-scale 门控(弱=打折,关=瞬时)。不用 parallax / scrub。
 * ========================================================================== */

/* 徽标文案与色调:克制映射,不做大红大绿。 */
const BADGE_META: Record<ProductBadge, { label: string; tone: TagTone }> = {
  new: { label: 'New', tone: 'accent' },
  bestseller: { label: 'Bestseller', tone: 'neutral' },
  limited: { label: 'Limited', tone: 'warning' },
};

const CATEGORY_LABEL = new Map<CategoryId, string>(categories.map((c) => [c.id, c.label]));

/* ------------------------------ 版面选品(静态目录,模块级算一次) ------------------------------ */

/** 首屏右上白块的主角。 */
const SHOT = products.find((p) => p.id === 'halo-lamp');

/** 货架:大卡 / 两张常规 / 横向宽卡 —— 恰好四个品类各一件。 */
const SHELF_LEAD = products.find((p) => p.id === 'duna-vase');
const SHELF_WIDE = products.find((p) => p.id === 'arc-bookend');
const SHELF_TAKEN = new Set(['duna-vase', 'halo-lamp', 'arc-bookend']);
const SHELF_MID = featuredProducts.filter((p) => !SHELF_TAKEN.has(p.id));

/** 满出血横滚:非精选的全部七款(要真的滚得动,才配得上「Scroll →」)。 */
const RESTOCK = products.filter((p) => !p.featured);

/** 品类带:编号 + 件数 + 该品类一句话。 */
const CATEGORY_TILES = categories.map((category, i) => ({
  category,
  index: String(i + 1).padStart(2, '0'),
  count: products.filter((p) => p.category === category.id).length,
}));

/* 跑马灯:每条前一个品类色点,四条重复两遍以无缝循环。 */
const TICKER: { cat: CategoryId; text: string }[] = [
  { cat: 'ceramics', text: 'Complimentary shipping over $150' },
  { cat: 'lighting', text: 'Autumn lighting has landed' },
  { cat: 'textiles', text: 'Repairs booked within 48 hours' },
  { cat: 'objects', text: 'Studio open Thursdays, 10:00–18:00' },
];

/* 首屏小柱状图:八根不等高的迷你柱,读作「每月修复量」的轮廓。 */
const SPARK = [0.38, 0.62, 0.47, 0.83, 0.66, 1, 0.55, 0.76];

/* 数字墙右侧的密集清单 —— 四行,每行:编号 / 标题 / 两行说明 / 右侧数值。 */
const FACTS = [
  {
    no: '01',
    title: 'Made where it is sold',
    copy: 'Thrown, wired and woven at the Mews. Nothing drop-shipped, nothing white-labelled, no third factory.',
    value: '100%',
  },
  {
    no: '02',
    title: 'Mended in nine days',
    copy: 'Chipped rim, frayed edge, dead driver — send it back and we mend it. No receipt, no warranty window.',
    value: '9d',
  },
  {
    no: '03',
    title: 'Out of the door in two days',
    copy: 'Orders leave East London within 48 hours, boxed in moulded pulp. No plastic film, no void fill.',
    value: '48h',
  },
  {
    no: '04',
    title: 'Kept, not returned',
    copy: 'Fewer than three in a hundred come back. We would rather you buy once and stop looking.',
    value: '2.8%',
  },
];

/* 数字墙左侧色块里的轮换短句(库 Carousel:fade + 自动播,无箭头无指示点)。 */
const STUDIO_NOTES = [
  'Fifty designs released since 2019. Thirty-eight retired since. Twelve still earn their shelf.',
  'Nothing is added because a season asks for it. A piece ships when it stops being improvable.',
  'The catalogue shrinks about as often as it grows. That is the whole idea.',
];

/* ------------------------------ 行内线性图标 ------------------------------ */

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

/* ------------------------------- 商品拼贴件 ------------------------------- */

/**
 * 货架 / 横滚共用的商品卡 —— 视觉 + 品类点 + 名称 / 一句话 / 价格。
 * 透传 ...rest:RevealGroup 经 cloneElement 注入 data-ms-reveal / style(--i),
 * 必须一路落到 <a> 上,滚动 reveal 才生效。
 */
function ProductCard({
  product,
  span = 'unit',
  className,
  ...rest
}: { product: Product; span?: 'unit' | 'lead' | 'wide' } & Omit<
  ComponentPropsWithoutRef<'a'>,
  'href'
>) {
  const badge = product.badges?.[0];
  return (
    // rest 先摊开(RevealGroup 注入的 data-ms-reveal / style 在里面),
    // 再写自己的 className —— 外部传入的类名手动并进来,不能被覆盖掉
    <RouterLink
      {...rest}
      to={`/products/${product.id}`}
      data-cat={product.category}
      className={[
        'sf-product-card sf-lift',
        span === 'lead' ? 'sf-product-card-lg' : '',
        span === 'wide' ? 'sf-product-card-wide' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ProductVisual product={product} aspect={span === 'wide' ? 'square' : 'portrait'} />
      <div className="sf-product-meta">
        <div className="sf-product-tagrow">
          <span className="sf-dot sf-cat-dot" />
          <span className="sf-product-cat">{CATEGORY_LABEL.get(product.category)}</span>
          {badge && (
            <Tag size="sm" variant="soft" tone={BADGE_META[badge].tone}>
              {BADGE_META[badge].label}
            </Tag>
          )}
        </div>
        <div className="sf-product-name">{product.name}</div>
        <div className="sf-product-row">
          <small>{product.tagline}</small>
          <span className="sf-product-price">
            {product.compareAt != null && (
              <span className="sf-price-compare">{money(product.compareAt)}</span>
            )}
            {money(product.price)}
          </span>
        </div>
      </div>
    </RouterLink>
  );
}

/* --------------------------------- 页面 ---------------------------------- */

export function Home() {
  return (
    <div className="home">
      {/* ======================= 1 · 首屏 bento 拼贴 ======================= */}
      {/* 整组一次 mount 观察:lead 无延迟先到,shot / stat / ticker 按 --i 错峰 */}
      <RevealGroup
        className="sf-tiles home-bento"
        trigger="mount"
        variant="up"
        stagger={90}
        as="section"
      >
        {/* lead:主色满色块,压住左侧两行 —— 版面的结构件 */}
        <div className="sf-tile sf-tile-solid home-lead">
          <p className="sf-kicker home-lead-kicker">Ceramics · Lighting · Textiles · Objects</p>
          <h1 className="sf-display sf-display-xl home-lead-title">
            Four rooms.
            <br />
            Four hundred decisions.
            <br />
            <span className="home-lead-sub">One shop that made them for you.</span>
          </h1>
          <div className="home-lead-foot">
            <p className="sf-lede home-lead-lede">
              Twelve pieces in the catalogue. Each one earns its shelf, or it goes.
            </p>
            <Button asChild size="lg" shape="pill" className="home-lead-cta">
              <RouterLink to="/products?category=ceramics">Start with ceramics</RouterLink>
            </Button>
          </div>
          <span className="sf-spectrum home-lead-spectrum" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>

        {/* shot:白块,整块可点进详情 */}
        {SHOT && (
          <RouterLink
            to={`/products/${SHOT.id}`}
            data-cat={SHOT.category}
            className="sf-tile sf-lift home-shot"
            aria-label={`${SHOT.name} — view product`}
          >
            <span className="home-shot-tagrow">
              <Tag size="sm" variant="solid" className="home-shot-tag">
                Restocked
              </Tag>
            </span>
            <ProductVisual product={SHOT} aspect="portrait" className="home-shot-pv" />
            <span className="home-shot-meta">
              <span className="home-shot-name">{SHOT.name}</span>
              <span className="sf-product-price">{money(SHOT.price)}</span>
            </span>
          </RouterLink>
        )}

        {/* stat1:墨色满色块 + 大数字 + 迷你柱。
            这里刻意不用品类色 —— 讲的是维修数,与任何品类无关;首屏留「靛蓝 / 白 / 墨」
            三段就够,四个品类色一字排开的主场留给下面的品类带,出场才有冲击。 */}
        <div className="sf-tile sf-tile-ink home-stat home-stat-fill">
          <p className="sf-kicker">Repaired, not replaced</p>
          <Statistic value={1204} animateOnMount className="home-figure" />
          <span className="home-spark" aria-hidden="true">
            {SPARK.map((h) => (
              <i key={h} style={{ height: `${Math.round(h * 100)}%` }} />
            ))}
          </span>
        </div>

        {/* stat2:白块,与左邻的满色块形成密度与色彩反差 */}
        <div className="sf-tile home-stat home-stat-side">
          <p className="sf-kicker">This week</p>
          <Statistic value={6} animateOnMount className="home-figure" />
          <p className="home-stat-note">new pieces off the wheel and onto the shelf</p>
        </div>

        {/* ticker:跨三列的墨色带,四条公告重复两遍无缝循环 */}
        <div className="sf-ticker home-ticker">
          <div className="sf-ticker-track">
            {[0, 1].map((pass) =>
              TICKER.map((item) => (
                <span
                  key={`${pass}-${item.cat}`}
                  data-cat={item.cat}
                  aria-hidden={pass === 1 || undefined}
                >
                  <i className="sf-dot sf-cat-dot" />
                  {item.text}
                </span>
              )),
            )}
          </div>
        </div>
      </RevealGroup>

      {/* =========================== 2 · 品类带 =========================== */}
      {/* RevealGroup 的 props 是封闭的(不透传 aria-*),语义外层单独包一层 nav */}
      <nav aria-label="Shop by category">
        <RevealGroup
          className="sf-tiles home-cats"
          variant="up"
          stagger={70}
          margin="0px 0px -8% 0px"
        >
          {CATEGORY_TILES.map(({ category, index, count }) => (
            <RouterLink
              key={category.id}
              to={`/products?category=${category.id}`}
              data-cat={category.id}
              className="sf-tile sf-cat-fill sf-lift home-cat"
            >
              <span className="sf-kicker home-cat-index">
                {index} · {count} pieces
              </span>
              <span className="sf-display sf-display-md home-cat-name">{category.label}</span>
              <span className="home-cat-note">{category.blurb} →</span>
            </RouterLink>
          ))}
        </RevealGroup>
      </nav>

      {/* ========================== 3 · 精选货架 ========================== */}
      <section className="sf-tiles home-shelf">
        <Reveal variant="up" distance={16} asChild>
          <div className="home-shelf-head">
            <h2 className="sf-display sf-display-lg">The pieces people keep coming back for.</h2>
            <div className="home-shelf-aside">
              <p className="sf-lede">
                Four of the twelve move fastest. We restock them the week they run out, in the same
                batch sizes as the first run.
              </p>
              <RouterLink to="/products" className="home-more">
                View all twelve →
              </RouterLink>
            </div>
          </div>
        </Reveal>

        <RevealGroup className="home-shelf-grid" variant="up" stagger={80}>
          {SHELF_LEAD && <ProductCard product={SHELF_LEAD} span="lead" />}
          {SHELF_MID.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {SHELF_WIDE && <ProductCard product={SHELF_WIDE} span="wide" />}
        </RevealGroup>
      </section>

      {/* =========================== 4 · 数字墙 =========================== */}
      {/* 左极简(一个超大数字)· 右密集(四行清单)—— 相邻区块的密度反差 */}
      <RevealGroup className="sf-tiles home-wall" variant="up" stagger={110} as="section">
        <div className="sf-tile sf-cat-fill home-wall-figure" data-cat="objects">
          <p className="sf-kicker">Since 2019</p>
          <span className="sf-numeral home-wall-numeral">50</span>
          {/* 轮换短句:fade + 自动播,无箭头无指示点,只作为版面上的一句话 */}
          <Carousel
            classNames={{ root: 'home-wall-rotator' }}
            effect="fade"
            arrows={false}
            dots={false}
            draggable={false}
            autoplay={{ interval: 4600 }}
            tone="neutral"
            aria-label="Studio notes"
          >
            {STUDIO_NOTES.map((note) => (
              <p key={note} className="sf-lede home-wall-note">
                {note}
              </p>
            ))}
          </Carousel>
        </div>

        <div className="sf-tile home-wall-facts">
          <p className="sf-kicker home-wall-facts-kicker">What that buys you</p>
          <List marker="none" spacing="none" className="home-facts">
            {FACTS.map((fact) => (
              <List.Item key={fact.no} className="home-fact">
                <span className="sf-index">{fact.no}</span>
                <span className="home-fact-body">
                  <span className="home-fact-title">{fact.title}</span>
                  <span className="home-fact-copy">{fact.copy}</span>
                </span>
                <span className="home-fact-value">{fact.value}</span>
              </List.Item>
            ))}
          </List>
        </div>
      </RevealGroup>

      {/* ======================== 5 · 满出血横滚 ======================== */}
      <section className="home-rail">
        <Reveal variant="up" distance={16} asChild>
          <div className="home-rail-head">
            <h2 className="sf-display sf-display-md">Back in stock this week</h2>
            <span className="sf-kicker">Scroll →</span>
          </div>
        </Reveal>
        {/* 库 ScrollArea:原生滚动 + 自绘滚动条(不占布局宽) */}
        <ScrollArea
          orientation="horizontal"
          type="hover"
          classNames={{ viewport: 'home-rail-viewport' }}
        >
          <RevealGroup className="home-rail-track" variant="up" stagger={60} amount={0.05}>
            {RESTOCK.map((product) => (
              <ProductCard key={product.id} product={product} className="home-rail-card" />
            ))}
          </RevealGroup>
        </ScrollArea>
      </section>

      {/* ================== 6 · 右下角聊天入口(全局浮钮) ================== */}
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
            <a className="home-chat-mail" href="mailto:hello@arden.studio">
              hello@arden.studio
            </a>
          </div>
        </Popover>
      </div>
    </div>
  );
}
