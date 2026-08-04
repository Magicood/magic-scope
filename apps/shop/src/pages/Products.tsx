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
 * Products —— 商品列表页:左侧粘性筛选栏(分类/价格/库存/标签)+ 右侧商品区
 * (排序 + 网格/列表切换 + 假加载骨架 + 分页)。?category= 与导航受控联动。
 * ========================================================================== */

const PAGE_SIZE = 8;
/* 价格滑杆上限(目录最贵 $420,留一点余量取整)。 */
const PRICE_CAP = 450;
/* 假加载时长:短到不烦躁,长到骨架可感知。 */
const FAKE_LOAD_MS = 350;

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

/* 每个分类的商品数(静态目录,模块级算一次)。 */
const CATEGORY_COUNTS = new Map(
  categories.map((c) => [c.id, products.filter((p) => p.category === c.id).length]),
);

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
  const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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

  /* ------------------------------ 页头文案 ------------------------------ */
  const activeCategory = cats.length === 1 ? categories.find((c) => c.id === cats[0]) : undefined;
  const title = activeCategory?.label ?? 'All pieces';
  const lede =
    activeCategory?.blurb ??
    'Twelve objects across four families — thrown, woven, cast and finished to stay.';
  const countText =
    sorted.length === products.length
      ? `${products.length} pieces`
      : `${sorted.length} of ${products.length} pieces`;

  const cards = pageItems.map((p) => (
    <RouterLink key={p.id} to={`/products/${p.id}`} className="sf-product-card">
      <GridCardInner product={p} />
    </RouterLink>
  ));

  /* 淡入用的重挂 key:内容(筛选+页码+视图)一变,容器重挂、动画重放。 */
  const contentKey = `${filterKey}|${safePage}|${view}`;

  return (
    <section className="pl-page">
      <div className="sf-container">
        <header className="pl-head">
          <Reveal trigger="mount" variant="fade" duration={500} asChild>
            <p className="sf-eyebrow">The collection</p>
          </Reveal>
          <h1 className="sf-display sf-display-lg">
            <Reveal as="span" trigger="mount" variant="mask-up" duration={650} delay={70}>
              {title}
            </Reveal>
          </h1>
          <Reveal trigger="mount" variant="up" distance={14} duration={600} delay={160} asChild>
            <div className="pl-head-sub">
              <p className="sf-lede">{lede}</p>
              <p className="pl-count">{countText}</p>
            </div>
          </Reveal>
        </header>

        <div className="pl-layout">
          {/* ------------------------- 筛选栏(桌面粘性) ------------------------- */}
          <Reveal trigger="mount" variant="fade" duration={600} delay={240} asChild>
            <aside className="pl-filters" aria-label="Product filters">
              <div className="pl-facet">
                <h3 className="pl-facet-title">Category</h3>
                <CheckboxGroup value={cats} onChange={setCats} size="sm">
                  {categories.map((c) => (
                    <Checkbox key={c.id} value={c.id}>
                      {c.label}
                      <span className="pl-facet-count">{CATEGORY_COUNTS.get(c.id) ?? 0}</span>
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </div>

              <hr className="sf-hairline" />

              <div className="pl-facet">
                <h3 className="pl-facet-title">Price</h3>
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
                <h3 className="pl-facet-title">Availability</h3>
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
                <h3 className="pl-facet-title">Highlights</h3>
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
            <Reveal trigger="mount" variant="fade" duration={550} delay={200} asChild>
              <div className="pl-toolbar">
                <div className="pl-toolbar-sort">
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
                </div>
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
                {pageItems.map((p) => (
                  <ListRow key={p.id} product={p} />
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
 * ------------------------------------------------------------------------- */
function GridCardInner({ product }: { product: Product }) {
  return (
    <>
      <div className="pl-card-media">
        <ProductVisual product={product} aspect="portrait" />
        {product.badges && product.badges.length > 0 ? (
          <span className="pl-card-badges">
            {product.badges.map((b) => (
              <Tag key={b} size="sm" tone={BADGE_META[b].tone}>
                {BADGE_META[b].label}
              </Tag>
            ))}
          </span>
        ) : null}
      </div>
      <div className="sf-product-meta">
        <div>
          <div className="sf-product-name">{product.name}</div>
          <div className="sf-product-tagline">{product.tagline}</div>
        </div>
        <div className="sf-product-price">
          {product.compareAt != null ? (
            <span className="sf-price-compare">{money(product.compareAt)}</span>
          ) : null}
          {money(product.price)}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------------
 * 列表行 —— 名称链接做 stretched-link 铺满整行;右侧操作区抬 z-index 保持可点。
 * ------------------------------------------------------------------------- */
function ListRow({ product }: { product: Product }) {
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
    <article className="pl-row">
      {/* 视觉列纯装饰:可访问名由名称链接承担 */}
      <div className="pl-row-media" aria-hidden="true">
        <ProductVisual product={product} aspect="square" />
      </div>

      <div className="pl-row-body">
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
 * 假加载骨架 —— 6 张,形状贴住当前视图的真实卡片/行,切换无跳动。
 * ------------------------------------------------------------------------- */
const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6'];

function ResultsSkeleton({ view }: { view: ViewMode }) {
  if (view === 'list') {
    return (
      <div className="pl-list" aria-hidden="true">
        {SKELETON_KEYS.map((k) => (
          <div key={k} className="pl-row pl-skel-row">
            <Skeleton className="pl-skel-row-media" />
            <div className="pl-skel-lines">
              <Skeleton variant="text" width="34%" />
              <Skeleton variant="text" width="58%" />
              <Skeleton variant="text" width="26%" />
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
      {SKELETON_KEYS.map((k) => (
        <div key={k} className="pl-skel-card">
          <Skeleton className="pl-skel-media" height="auto" />
          <div className="pl-skel-meta">
            <Skeleton variant="text" width="52%" />
            <Skeleton variant="text" width={44} />
          </div>
          <Skeleton variant="text" width="38%" />
        </div>
      ))}
    </div>
  );
}
