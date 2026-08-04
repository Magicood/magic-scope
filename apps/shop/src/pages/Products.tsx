import {
  BackTop,
  Button,
  Checkbox,
  CheckboxGroup,
  Empty,
  Pagination,
  Rate,
  Reveal,
  RevealGroup,
  Segmented,
  Select,
  type SelectOption,
  Skeleton,
  Slider,
  Switch,
  Tag,
  type TagTone,
  toast,
} from '@magic-scope/react';
import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { ProductVisual } from '../components/ProductVisual';
import { categories, products } from '../data/products';
import type { Product, ProductBadge } from '../data/types';
import { money } from '../lib/format';
import { navigate, queryOf, RouterLink } from '../lib/router';
import { useCart } from '../lib/store';
import './Products.css';

/* ============================================================================
 * Products —— 商品列表页(Chromatic Grid 版式)
 *
 * 版面骨架 = 三块拼贴:
 *   ① 页头 1.6fr / 1fr —— 左满色块(选中分类即该品类色)扛标题,右白块扛结果大数字 + 密集筛选摘要;
 *   ② 左 220px 白色筛选拼贴块(粘性),分组之间发丝线,分类项前挂品类色点;
 *   ③ 右商品区 —— 4 列网格里穿插大卡(跨 2×2)与宽卡(跨 2 列)打破等分。
 * 筛选 / 排序 / 分页 / 视图切换 / 假加载的逻辑与组件全部沿用,改的只是版式与视觉。
 * ========================================================================== */

const PAGE_SIZE = 8;
/* 价格滑杆上限(目录最贵 $420,留一点余量取整)。 */
const PRICE_CAP = 450;
/* 假加载时长:短到不烦躁,长到骨架可感知。 */
const FAKE_LOAD_MS = 350;
/* 网格列数 —— 卡型编排要按它算尾行余数,和 Products.css 的列模板是一对。 */
const GRID_COLS = 4;

type SortMode = 'featured' | 'price-asc' | 'price-desc' | 'rating';
type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: SelectOption[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'rating', label: 'Top rated' },
];

/* 徽标筛选的展示顺序与配色(克制:soft 变体、低语义色)。 */
const BADGE_ORDER: ProductBadge[] = ['new', 'bestseller', 'limited'];
const BADGE_META: Record<ProductBadge, { label: string; tone: TagTone }> = {
  new: { label: 'New', tone: 'accent' },
  bestseller: { label: 'Bestseller', tone: 'neutral' },
  limited: { label: 'Limited', tone: 'warning' },
};

/* 每个分类的商品数与名称(静态目录,模块级算一次)。 */
const CATEGORY_COUNTS = new Map(
  categories.map((c) => [c.id, products.filter((p) => p.category === c.id).length]),
);
/* 键放宽成 string:筛选态 cats 是 string[](受 URL 影响),不必为查名而收窄 */
const CATEGORY_LABELS = new Map<string, string>(categories.map((c) => [c.id, c.label]));

/* 两位数序号:等宽小字的索引,和超大数字构成尺度对比。 */
const pad2 = (n: number) => String(n).padStart(2, '0');

/* ---------------------------------------------------------------------------
 * 卡型编排 —— 网格用 4 等列,但靠混排卡型打破等分节奏。
 * 规则:全局每 7 张出一张大卡(跨 2×2,分页后节奏依旧连续);页内没命中就退回首张,
 * 保证任何一页都不会退化成规规矩矩的等分方阵。大卡多吃 3 格,尾行余下的空格由末尾
 * 若干张升级成宽卡(跨 2 列、图左信息右)补平 —— 于是尾行永远铺满,不留半行空洞。
 * ------------------------------------------------------------------------- */
type CardSpan = 'lg' | 'wide' | null;

function planCards(offset: number, count: number): CardSpan[] {
  if (count <= 0) return [];
  /* 结果极少时直接用大卡 / 宽卡占满一行,免得孤零零一张小卡挂在左上角 */
  if (count === 1) return ['lg'];
  if (count === 2) return ['wide', 'wide'];

  const spans = new Array<CardSpan>(count).fill(null);
  const anchors: number[] = [];
  for (let i = 0; i < count; i += 1) {
    /* 后面至少还剩 4 张才放大卡 —— 大卡 + 4 张小卡刚好补满两行 */
    if ((offset + i) % 7 === 0 && count - i >= 5) anchors.push(i);
  }
  if (anchors.length === 0) anchors.push(0);
  for (const i of anchors) spans[i] = 'lg';

  let cells = count + anchors.length * 3;
  for (let i = count - 1; i >= 0 && cells % GRID_COLS !== 0; i -= 1) {
    if (spans[i] === null) {
      spans[i] = 'wide';
      cells += 1;
    }
  }
  return spans;
}

const spanClass = (span: CardSpan) =>
  span === 'lg' ? 'sf-product-card-lg' : span === 'wide' ? 'sf-product-card-wide' : '';

/* ------------------------- 视图切换图标(15px,与页头同风格) ------------------------- */

const GridIcon = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="4.6" height="4.6" rx="1.3" stroke="currentColor" strokeWidth="1.2" />
    <rect x="8.4" y="2" width="4.6" height="4.6" rx="1.3" stroke="currentColor" strokeWidth="1.2" />
    <rect x="2" y="8.4" width="4.6" height="4.6" rx="1.3" stroke="currentColor" strokeWidth="1.2" />
    <rect
      x="8.4"
      y="8.4"
      width="4.6"
      height="4.6"
      rx="1.3"
      stroke="currentColor"
      strokeWidth="1.2"
    />
  </svg>
);

const ListIcon = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M2.2 3.7h1.1M5.5 3.7h7.3M2.2 7.5h1.1M5.5 7.5h7.3M2.2 11.3h1.1M5.5 11.3h7.3"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

export function Products({ routePath }: { routePath: string }) {
  /* URL 的 ?category=(只认合法分类 id,脏值当没有)。 */
  const urlCategory = useMemo(() => {
    const q = queryOf(routePath).get('category');
    return q != null && categories.some((c) => c.id === q) ? q : null;
  }, [routePath]);

  /* ------------------------------ 筛选状态 ------------------------------ */
  const [cats, setCats] = useState<string[]>(() => (urlCategory ? [urlCategory] : []));
  /* 价格双通道:draft 跟手显示,松手才提交给过滤(避免拖动途中反复假加载)。 */
  const [maxPriceDraft, setMaxPriceDraft] = useState(PRICE_CAP);
  const [maxPrice, setMaxPrice] = useState(PRICE_CAP);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [badges, setBadges] = useState<ProductBadge[]>([]);
  const [sort, setSort] = useState<SortMode>('featured');
  const [view, setView] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  /* 首屏 stagger 只演一次:任何筛选/翻页/切视图之后改走静默渲染 + 轻淡入。 */
  const [entranceDone, setEntranceDone] = useState(false);

  const mainRef = useRef<HTMLDivElement>(null);

  /* 导航变化(页头分类链接)→ 受控同步勾选;仅 URL 单选映射进多选组。 */
  useEffect(() => {
    setCats(urlCategory ? [urlCategory] : []);
  }, [urlCategory]);

  /* 已生效的筛选指纹:变化才触发假加载;render 期间与之比对可消掉切换瞬间的闪帧。 */
  const filterKey = useMemo(
    () => [cats.join('+'), maxPrice, inStockOnly ? 1 : 0, badges.join('+'), sort].join('|'),
    [cats, maxPrice, inStockOnly, badges, sort],
  );
  const appliedKey = useRef(filterKey);

  useEffect(() => {
    if (appliedKey.current === filterKey) return;
    setEntranceDone(true);
    setPage(1);
    setLoading(true);
    const timer = window.setTimeout(() => {
      appliedKey.current = filterKey;
      setLoading(false);
    }, FAKE_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, [filterKey]);

  const pending = loading || appliedKey.current !== filterKey;

  /* ------------------------------ 过滤与排序 ------------------------------ */
  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (cats.length === 0 || cats.includes(p.category)) &&
          p.price <= maxPrice &&
          (!inStockOnly || p.stock > 0) &&
          (badges.length === 0 || badges.some((b) => p.badges?.includes(b))),
      ),
    [cats, maxPrice, inStockOnly, badges],
  );

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        /* Featured:精选置前,组内保持目录手排顺序(sort 稳定)。 */
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return list;
  }, [filtered, sort]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(1, totalPages));
  const offset = (safePage - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(offset, offset + PAGE_SIZE);

  const hasActiveFilters =
    cats.length > 0 || maxPrice < PRICE_CAP || inStockOnly || badges.length > 0;

  const clearFilters = () => {
    setCats([]);
    setMaxPrice(PRICE_CAP);
    setMaxPriceDraft(PRICE_CAP);
    setInStockOnly(false);
    setBadges([]);
    /* URL 还挂着 ?category= 时一并抹掉,让地址栏与筛选一致。 */
    if (urlCategory) navigate('/products');
  };

  const toggleBadge = (b: ProductBadge) =>
    setBadges((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));

  const handleViewChange = (value: string) => {
    setEntranceDone(true);
    setView(value === 'list' ? 'list' : 'grid');
  };

  const handlePageChange = (next: number) => {
    setEntranceDone(true);
    setPage(next);
    /* 翻页后把商品区顶到视口(scroll-margin 让出 sticky 头)。 */
    mainRef.current?.scrollIntoView({ block: 'start' });
  };

  /* ------------------------------ 页头拼贴文案 ------------------------------ */
  const activeCategory = cats.length === 1 ? categories.find((c) => c.id === cats[0]) : undefined;
  const title = activeCategory?.label ?? 'All pieces';
  const lede =
    activeCategory?.blurb ??
    'Twelve objects across four families — thrown, woven, cast and finished to stay.';

  /* 右侧白块的密集摘要:五条口径常驻(未启用的写「不限」),
     一份紧排清单顶在超大数字下面 —— 页头的密度反差就靠这一疏一密。 */
  const summaryRows: { key: string; value: string }[] = [
    {
      key: 'Family',
      value:
        cats.length === 0
          ? 'All four'
          : cats.map((id) => CATEGORY_LABELS.get(id) ?? id).join(' · '),
    },
    {
      key: 'Order',
      value: SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Featured',
    },
    { key: 'Ceiling', value: maxPrice < PRICE_CAP ? `Up to ${money(maxPrice)}` : 'No limit' },
    { key: 'Stock', value: inStockOnly ? 'In stock only' : 'Any' },
    {
      key: 'Tagged',
      value: badges.length > 0 ? badges.map((b) => BADGE_META[b].label).join(' · ') : 'Any',
    },
  ];

  const rangeStart = sorted.length === 0 ? 0 : offset + 1;
  const rangeEnd = offset + pageItems.length;

  /* 家族配比条:当前结果按品类的比例,用四品类色画成一条数据条。
     色彩在这里是编码而不是装饰 —— 一眼看出这批结果偏哪一族。 */
  const familySplit = categories
    .map((c) => ({
      id: c.id,
      label: c.label,
      count: sorted.filter((p) => p.category === c.id).length,
    }))
    .filter((row) => row.count > 0);

  /* ------------------------------ 卡片编排 ------------------------------ */
  const plan = planCards(offset, pageItems.length);

  const cards = pageItems.map((p, i) => (
    <RouterLink
      key={p.id}
      to={`/products/${p.id}`}
      className={['sf-product-card', spanClass(plan[i] ?? null)].filter(Boolean).join(' ')}
      data-cat={p.category}
    >
      <GridCardInner product={p} index={offset + i + 1} />
    </RouterLink>
  ));

  /* 淡入用的重挂 key:内容(筛选+页码+视图)一变,容器重挂、动画重放。 */
  const contentKey = `${filterKey}|${safePage}|${view}`;

  return (
    <section className="pl-page">
      <div className="sf-container">
        {/* ============================ 页头拼贴 ============================ */}
        <header className="pl-head">
          <Reveal trigger="mount" variant="fade" duration={520} asChild>
            <div
              className={`sf-tile pl-head-hero ${activeCategory ? 'sf-cat-fill' : 'sf-tile-solid'}`}
              data-cat={activeCategory?.id}
            >
              <p className="sf-kicker sf-kicker-dot pl-head-kicker">The collection</p>
              <h1 className="sf-display sf-display-lg pl-head-title">
                <Reveal as="span" trigger="mount" variant="mask-up" duration={640} delay={90}>
                  {title}
                </Reveal>
              </h1>
              <p className="sf-lede pl-head-lede">{lede}</p>
              <span className="sf-spectrum pl-head-spectrum" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>
          </Reveal>

          <Reveal trigger="mount" variant="up" distance={14} duration={600} delay={170} asChild>
            <div className="sf-tile pl-head-count">
              <div className="pl-count-block">
                <p className="sf-numeral pl-count-num">{sorted.length}</p>
                <p className="pl-count-unit">
                  {sorted.length === 1 ? 'piece' : 'pieces'}
                  {sorted.length === products.length ? null : (
                    <span className="sf-index">of {products.length}</span>
                  )}
                </p>
                {familySplit.length > 0 ? (
                  <div
                    className="pl-split"
                    role="img"
                    aria-label={familySplit.map((r) => `${r.label}: ${r.count}`).join(', ')}
                  >
                    {familySplit.map((row) => (
                      <i
                        key={row.id}
                        data-cat={row.id}
                        className="sf-cat-fill"
                        style={{ flexGrow: row.count }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              <hr className="sf-hairline pl-count-rule" />

              <dl className="pl-summary">
                {summaryRows.map((row) => (
                  <div key={row.key} className="pl-summary-row">
                    <dt className="sf-index">{row.key}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </header>

        <div className="pl-layout">
          {/* ------------------------- 筛选拼贴块(桌面粘性) ------------------------- */}
          <Reveal trigger="mount" variant="fade" duration={600} delay={250} asChild>
            <aside className="sf-tile pl-filters" aria-label="Product filters">
              <div className="pl-facet">
                <h2 className="pl-facet-title">Category</h2>
                <CheckboxGroup value={cats} onChange={setCats} size="sm">
                  {categories.map((c) => (
                    <Checkbox key={c.id} value={c.id}>
                      <span className="pl-cat" data-cat={c.id}>
                        <i className="sf-dot sf-cat-dot" aria-hidden="true" />
                        <span className="pl-cat-label">{c.label}</span>
                        <span className="pl-facet-count">{CATEGORY_COUNTS.get(c.id) ?? 0}</span>
                      </span>
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </div>

              <hr className="sf-hairline" />

              <div className="pl-facet">
                <h2 className="pl-facet-title">Price</h2>
                <Slider
                  min={0}
                  max={PRICE_CAP}
                  step={10}
                  value={maxPriceDraft}
                  onValueChange={setMaxPriceDraft}
                  onChangeEnd={setMaxPrice}
                  size="sm"
                  aria-label="Maximum price"
                />
                <p className="pl-facet-value">Up to {money(maxPriceDraft)}</p>
              </div>

              <hr className="sf-hairline" />

              <div className="pl-facet">
                <h2 className="pl-facet-title">Availability</h2>
                <Switch
                  size="sm"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                >
                  In stock only
                </Switch>
              </div>

              <hr className="sf-hairline" />

              <div className="pl-facet">
                <h2 className="pl-facet-title">Highlights</h2>
                <div className="pl-facet-tags">
                  {BADGE_ORDER.map((b) => (
                    <Tag
                      key={b}
                      checkable
                      selected={badges.includes(b)}
                      tone={BADGE_META[b].tone}
                      onClick={() => toggleBadge(b)}
                    >
                      {BADGE_META[b].label}
                    </Tag>
                  ))}
                </div>
              </div>

              {hasActiveFilters ? (
                <Button variant="link" size="sm" className="pl-clear" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : null}
            </aside>
          </Reveal>

          {/* ------------------------------ 商品区 ------------------------------ */}
          <div className="pl-main" ref={mainRef} aria-busy={pending || undefined}>
            <Reveal trigger="mount" variant="fade" duration={550} delay={210} asChild>
              <div className="pl-toolbar">
                <p className="sf-index pl-toolbar-range">
                  {pad2(rangeStart)} — {pad2(rangeEnd)} / {pad2(sorted.length)}
                </p>
                <div className="pl-toolbar-controls">
                  <span className="pl-toolbar-label" aria-hidden="true">
                    Sort
                  </span>
                  <Select
                    options={SORT_OPTIONS}
                    value={sort}
                    size="sm"
                    aria-label="Sort products"
                    classNames={{ trigger: 'pl-sort-trigger' }}
                    onChange={(value) => {
                      if (typeof value === 'string' && value !== '') setSort(value as SortMode);
                    }}
                  />
                  <Segmented
                    size="sm"
                    value={view}
                    onValueChange={handleViewChange}
                    aria-label="Layout"
                    options={[
                      {
                        value: 'grid',
                        icon: GridIcon,
                        label: <span className="pl-vh">Grid view</span>,
                      },
                      {
                        value: 'list',
                        icon: ListIcon,
                        label: <span className="pl-vh">List view</span>,
                      },
                    ]}
                  />
                </div>
              </div>
            </Reveal>

            {pending ? (
              <ResultsSkeleton view={view} />
            ) : sorted.length === 0 ? (
              <div className="pl-empty">
                <Empty image="simple" description="No pieces match those filters.">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </Empty>
              </div>
            ) : view === 'list' ? (
              <div key={contentKey} className="pl-list pl-fade-in">
                {pageItems.map((p, i) => (
                  <ListRow key={p.id} product={p} index={offset + i + 1} />
                ))}
              </div>
            ) : entranceDone ? (
              <div key={contentKey} className="pl-grid pl-fade-in">
                {cards}
              </div>
            ) : (
              /* 首屏唯一一次编排:整组进视口后按 55ms 波浪错峰浮现;
                 位移/时长走 Reveal 的 CSS 变量(RevealGroup 只管错峰与触发) */
              <RevealGroup
                className="pl-grid"
                variant="up"
                stagger={55}
                amount={0.05}
                style={
                  {
                    '--ms-reveal-distance': '16px',
                    '--ms-reveal-duration': '620ms',
                  } as CSSProperties
                }
              >
                {cards}
              </RevealGroup>
            )}

            {!pending && totalPages > 1 ? (
              <div className="pl-pagination">
                <Pagination page={safePage} total={totalPages} onPageChange={handlePageChange} />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <BackTop visibilityHeight={560} />
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * 网格卡内容 —— 外层 RouterLink 即卡片(整卡可点),这里只负责视觉与 meta。
 * 顶行是「品类色点 + 品类名 + 等宽序号」:色彩当信息编码,序号当极小尺度的对照物。
 * ------------------------------------------------------------------------- */
function GridCardInner({ product, index }: { product: Product; index: number }) {
  return (
    <>
      <div className="pl-card-media">
        <ProductVisual product={product} aspect="square" />
        {product.badges && product.badges.length > 0 ? (
          <span className="pl-card-badges">
            {product.badges.map((b) => (
              <Tag key={b} size="sm" variant="solid" tone="neutral" className="sf-badge">
                {BADGE_META[b].label}
              </Tag>
            ))}
          </span>
        ) : null}
      </div>
      <div className="sf-product-meta">
        <div className="sf-product-tagrow">
          <i className="sf-dot sf-cat-dot" aria-hidden="true" />
          <span className="sf-product-cat">{CATEGORY_LABELS.get(product.category)}</span>
          <span className="sf-index pl-card-index">{pad2(index)}</span>
        </div>
        {/* 名称与价格同一条基线,一句话卖点另起一行 —— 窄列里才不会互相挤断 */}
        <div className="sf-product-row">
          <div className="sf-product-name">{product.name}</div>
          <span className="sf-product-price">
            {product.compareAt != null ? (
              <span className="sf-price-compare">{money(product.compareAt)}</span>
            ) : null}
            {money(product.price)}
          </span>
        </div>
        <small className="pl-card-tagline">{product.tagline}</small>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------------
 * 列表行 —— 宽卡的语言:自身就是一块白色拼贴件(图左 / 信息中 / 价格右,列宽不等分)。
 * 名称链接做 stretched-link 铺满整行;右侧操作区抬 z-index 保持可点。
 * ------------------------------------------------------------------------- */
function ListRow({ product, index }: { product: Product; index: number }) {
  const { add, openDrawer } = useCart();
  const firstColorway = product.colorways[0];
  const firstDetail = product.details[0];

  const addToCart = () => {
    if (!firstColorway) return;
    add(product.id, firstColorway.id);
    toast.success('Added to cart', {
      description: `${product.name} · ${firstColorway.label}`,
      action: { label: 'View cart', onClick: openDrawer },
    });
  };

  return (
    <article className="pl-row sf-lift" data-cat={product.category}>
      {/* 视觉列纯装饰:可访问名由名称链接承担 */}
      <div className="pl-row-media" aria-hidden="true">
        <ProductVisual product={product} aspect="wide" />
      </div>

      <div className="pl-row-body">
        <div className="sf-product-tagrow">
          <i className="sf-dot sf-cat-dot" aria-hidden="true" />
          <span className="sf-product-cat">{CATEGORY_LABELS.get(product.category)}</span>
          <span className="sf-index pl-row-index">{pad2(index)}</span>
        </div>
        <RouterLink to={`/products/${product.id}`} className="pl-row-name">
          {product.name}
        </RouterLink>
        <p className="pl-row-tagline">{product.tagline}</p>
        {firstDetail ? <p className="pl-row-detail">{firstDetail}</p> : null}
        <div className="pl-row-rating">
          <Rate
            value={product.rating}
            allowHalf
            readOnly
            size="sm"
            aria-label={`Rated ${product.rating} out of 5`}
          />
          <span className="pl-row-reviews">
            {product.rating.toFixed(1)} · {product.reviews} reviews
          </span>
        </div>
      </div>

      <div className="pl-row-side">
        <p className="pl-row-price">
          {product.compareAt != null ? (
            <span className="sf-price-compare">{money(product.compareAt)}</span>
          ) : null}
          {money(product.price)}
        </p>
        <Button variant="ghost" size="sm" onClick={addToCart}>
          Add to cart
        </Button>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------------------
 * 假加载骨架 —— 形状跟着真实卡型走(含跨 2×2 的大卡与跨 2 列的宽卡),切换无跳动。
 * ------------------------------------------------------------------------- */
const GRID_SKELETON_KEYS = Array.from({ length: PAGE_SIZE }, (_, i) => `g${i + 1}`);
const GRID_SKELETON_PLAN = planCards(0, PAGE_SIZE);
const LIST_SKELETON_KEYS = ['r1', 'r2', 'r3', 'r4', 'r5'];

function ResultsSkeleton({ view }: { view: ViewMode }) {
  if (view === 'list') {
    return (
      <div className="pl-list" aria-hidden="true">
        {LIST_SKELETON_KEYS.map((k) => (
          <div key={k} className="pl-row pl-skel-row">
            <Skeleton className="pl-skel-row-media" />
            <div className="pl-skel-lines">
              <Skeleton variant="text" width="26%" />
              <Skeleton variant="text" width="46%" />
              <Skeleton variant="text" width="34%" />
            </div>
            <div className="pl-skel-side">
              <Skeleton variant="text" width={56} />
              <Skeleton variant="text" width={92} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="pl-grid" aria-hidden="true">
      {GRID_SKELETON_KEYS.map((k, i) => (
        <div
          key={k}
          className={['sf-product-card', 'pl-skel-card', spanClass(GRID_SKELETON_PLAN[i] ?? null)]
            .filter(Boolean)
            .join(' ')}
        >
          <Skeleton className="pl-skel-media" height="auto" />
          <div className="pl-skel-meta">
            <Skeleton variant="text" width="42%" />
            <Skeleton variant="text" width="66%" />
            <Skeleton variant="text" width={48} />
          </div>
        </div>
      ))}
    </div>
  );
}
