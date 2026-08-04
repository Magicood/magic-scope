import {
  Button,
  List,
  Progress,
  Select,
  type SelectOption,
  Statistic,
  Table,
  type TableColumn,
  Tag,
  toast,
} from '@magic-scope/react';
import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { customers } from '../data/customers';
import { type DailyPoint, overviewStats, revenueSeries } from '../data/metrics';
import { orders } from '../data/orders';
import { products } from '../data/products';
import type { Order, OrderStatus, Product } from '../data/types';
import { formatDate, money } from '../lib/format';
import { navigate, RouterLink } from '../lib/router';
import './Overview.css';

/* ============================================================================
 * Overview —— 后台总览。版面按 Chromatic Grid 的控制台方言排:
 *   ① KPI 带 1.5fr/1fr/1fr/1fr,首块是主色满色块(超大数字),右侧三块小一档;
 *   ② 收入行 1fr/3.05fr —— 左边一块密集的墨色摘要,右边一张空的面积图(密度反差);
 *   ③ 底部 1.85fr/1fr —— 左表格,右两块清单。
 * 状态一律用色条(.ad-status)而不是彩色药丸,单号等宽。
 * 动效克制:仅 Statistic animateOnMount 与 hover 过渡(后台不做滚动编排)。
 * ========================================================================== */

/* ------------------------------ 静态派生数据 ------------------------------ */

/** customerId → 姓名(订单表与侧卡共用)。 */
const CUSTOMER_NAME = new Map(customers.map((c) => [c.id, c.name]));

/** 最近订单:数组已按 demo 单置顶 + placedAt 倒序,直接切前 8 条。 */
const RECENT_ORDERS = orders.slice(0, 8);

const PENDING_COUNT = orders.filter((o) => o.status === 'pending').length;
const REFUND_COUNT = orders.filter((o) => o.status === 'refunded').length;
const LOW_STOCK = products.filter((p) => p.stock < 15);
/** 待处理清单的总行数(页头小号计数用)。 */
const ATTENTION_ROWS = LOW_STOCK.length + 2;

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  fulfilled: 'Fulfilled',
  shipped: 'Shipped',
  delivered: 'Delivered',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

interface TopProduct {
  product: Product;
  count: number;
  /** 占全部订单行的百分比(整数)。 */
  share: number;
}

/** 热销榜:按商品在订单行里的出现次数聚合,取前 5。 */
const TOP_PRODUCTS: TopProduct[] = (() => {
  const counts = new Map<string, number>();
  let totalLines = 0;
  for (const order of orders) {
    for (const item of order.items) {
      counts.set(item.productId, (counts.get(item.productId) ?? 0) + 1);
      totalLines += 1;
    }
  }
  const ranked: TopProduct[] = [];
  for (const [id, count] of counts) {
    const product = products.find((p) => p.id === id);
    if (product) {
      ranked.push({ product, count, share: Math.round((count / totalLines) * 100) });
    }
  }
  ranked.sort((a, b) => b.count - a.count || a.product.name.localeCompare(b.product.name));
  return ranked.slice(0, 5);
})();

/* ------------------------------- 表格列定义 ------------------------------- */

const ORDER_COLUMNS: TableColumn<Order>[] = [
  {
    key: 'number',
    header: 'Order',
    render: (row) => <span className="ad-ord">{row.number}</span>,
  },
  {
    key: 'customer',
    header: 'Customer',
    render: (row) => CUSTOMER_NAME.get(row.customerId) ?? '—',
  },
  {
    key: 'status',
    header: 'Status',
    // 色条编码,不用彩色药丸 —— 表格里更安静、更好扫
    render: (row) => (
      <span className={`ad-status ad-status-${row.status}`}>{STATUS_LABEL[row.status]}</span>
    ),
  },
  {
    key: 'total',
    header: 'Total',
    align: 'end',
    render: (row) => <span className="ov-num">{money(row.total)}</span>,
  },
  {
    key: 'placedAt',
    header: 'Placed',
    align: 'end',
    render: (row) => <span className="ov-cell-muted">{formatDate(row.placedAt)}</span>,
  },
];

/* ------------------------------ 时间范围选择 ------------------------------ */

type RangeKey = '30' | '14' | '7';

const RANGE_OPTIONS: SelectOption[] = [
  { value: '30', label: 'Last 30 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '7', label: 'Last 7 days' },
];

/* ------------------------------ 区间摘要计算 ------------------------------ */

interface RangeDigest {
  peak: DailyPoint | null;
  low: DailyPoint | null;
  /** 日均收入(整数)。 */
  avg: number;
  total: number;
  orders: number;
}

/** 从当前区间的日点算出峰值 / 谷值 / 日均 / 合计(墨色摘要块消费)。 */
function digestOf(points: DailyPoint[]): RangeDigest {
  let peak: DailyPoint | null = null;
  let low: DailyPoint | null = null;
  let total = 0;
  let orders = 0;
  for (const p of points) {
    total += p.revenue;
    orders += p.orders;
    if (peak === null || p.revenue > peak.revenue) peak = p;
    if (low === null || p.revenue < low.revenue) low = p;
  }
  return {
    peak,
    low,
    avg: points.length > 0 ? Math.round(total / points.length) : 0,
    total,
    orders,
  };
}

/* ------------------------------ 图表纯函数 -------------------------------- */

interface ChartPoint {
  x: number;
  y: number;
}

/** 保留两位小数,压短 path 字符串。 */
function r2(v: number): number {
  return Math.round(v * 100) / 100;
}

/** Catmull-Rom 转三次贝塞尔:把折线柔化成平滑曲线。 */
function smoothPath(pts: ChartPoint[]): string {
  const first = pts[0];
  if (!first) return '';
  let d = `M ${first.x} ${first.y}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    if (!p1 || !p2) continue;
    const p0 = pts[i - 1] ?? p1;
    const p3 = pts[i + 2] ?? p2;
    const c1x = r2(p1.x + (p2.x - p0.x) / 6);
    const c1y = r2(p1.y + (p2.y - p0.y) / 6);
    const c2x = r2(p2.x - (p3.x - p1.x) / 6);
    const c2y = r2(p2.y - (p3.y - p1.y) / 6);
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 'YYYY-MM-DD' → 'Jul 5'。手工拆分,避开 new Date 的时区偏移。 */
function shortDate(iso: string): string {
  const parts = iso.split('-');
  const month = MONTHS[Number(parts[1] ?? '1') - 1] ?? '';
  return `${month} ${Number(parts[2] ?? '1')}`;
}

/** y 轴刻度文案:1000 → $1k、1500 → $1.5k。 */
function axisLabel(v: number): string {
  if (v >= 1000) {
    const k = v / 1000;
    return `$${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return `$${v}`;
}

/* ------------------------------ 收入面积图 -------------------------------- */

const CHART_HEIGHT = 256;
const PAD = { top: 18, right: 12, bottom: 28, left: 46 } as const;

/**
 * 手写 SVG 面积折线图(无第三方):平滑曲线 + 线下渐变,
 * ResizeObserver 跟随容器宽度,hover 出竖参考线与自绘 tooltip。
 */
function RevenueChart({ points }: { points: DailyPoint[] }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(720);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const n = points.length;
  const innerW = Math.max(width - PAD.left - PAD.right, 16);
  const innerH = CHART_HEIGHT - PAD.top - PAD.bottom;
  const maxRevenue = points.reduce((m, p) => Math.max(m, p.revenue), 0);
  // 网格步长取整到 250,保证 3 条网格线都落在整数刻度上
  const gridStep = Math.max(250, Math.ceil(maxRevenue / 3 / 250) * 250);
  const yMax = gridStep * 3;

  const xAt = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yAt = (v: number) => PAD.top + innerH * (1 - v / yMax);

  const pts: ChartPoint[] = points.map((p, i) => ({ x: r2(xAt(i)), y: r2(yAt(p.revenue)) }));
  const linePath = smoothPath(pts);
  const firstPt = pts[0];
  const lastPt = pts[n - 1];
  const baseY = r2(PAD.top + innerH);
  const areaPath =
    firstPt && lastPt ? `${linePath} L ${lastPt.x} ${baseY} L ${firstPt.x} ${baseY} Z` : '';

  // x 轴 5 个日期刻度(首尾各一 + 三等分)
  const tickIndexes =
    n > 1 ? [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(t * (n - 1))) : n === 1 ? [0] : [];

  const safeHover = hoverIndex != null && hoverIndex >= 0 && hoverIndex < n ? hoverIndex : null;
  const hoverDatum = safeHover != null ? points[safeHover] : undefined;
  const hoverPos = safeHover != null ? pts[safeHover] : undefined;
  // tooltip 水平方向夹进容器,避免贴边被裁
  const tipLeft = hoverPos ? Math.min(Math.max(hoverPos.x, 78), Math.max(width - 78, 78)) : 0;

  const handlePointer = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (n === 0) return;
    if (n === 1) {
      setHoverIndex(0);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left - PAD.left) / innerW;
    setHoverIndex(Math.min(n - 1, Math.max(0, Math.round(ratio * (n - 1)))));
  };

  return (
    <div ref={wrapRef} className="ov-chart">
      <svg
        className="ov-chart-svg"
        width={width}
        height={CHART_HEIGHT}
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        role="img"
        aria-label={`Revenue trend, last ${n} days`}
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="ov-revenue-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ms-color-primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--ms-color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* y 轴:3 条发丝网格 + 刻度 */}
        {[1, 2, 3].map((step) => {
          const gy = r2(yAt(gridStep * step));
          return (
            <g key={step}>
              <line
                className="ov-chart-grid"
                x1={PAD.left}
                x2={width - PAD.right}
                y1={gy}
                y2={gy}
              />
              <text className="ov-chart-axis" x={PAD.left - 10} y={gy + 3} textAnchor="end">
                {axisLabel(gridStep * step)}
              </text>
            </g>
          );
        })}

        {/* x 轴:5 个日期刻度(首尾锚点朝内,避免出界) */}
        {tickIndexes.map((idx, i) => {
          const p = points[idx];
          if (!p) return null;
          const anchor = i === 0 ? 'start' : i === tickIndexes.length - 1 ? 'end' : 'middle';
          return (
            <text
              key={p.date}
              className="ov-chart-axis"
              x={r2(xAt(idx))}
              y={CHART_HEIGHT - 8}
              textAnchor={anchor}
            >
              {shortDate(p.date)}
            </text>
          );
        })}

        {areaPath && <path d={areaPath} fill="url(#ov-revenue-fill)" />}
        {linePath && <path d={linePath} className="ov-chart-line" />}
        {lastPt && <circle className="ov-chart-end" cx={lastPt.x} cy={lastPt.y} r="3" />}

        {hoverPos && (
          <g>
            <line
              className="ov-chart-cursor"
              x1={hoverPos.x}
              x2={hoverPos.x}
              y1={PAD.top}
              y2={baseY}
            />
            <circle className="ov-chart-dot" cx={hoverPos.x} cy={hoverPos.y} r="3.5" />
          </g>
        )}
      </svg>

      {hoverDatum && hoverPos && (
        <div className="ov-chart-tip" style={{ left: tipLeft, top: hoverPos.y }}>
          <span className="ov-chart-tip-date">{shortDate(hoverDatum.date)}</span>
          <span className="ov-chart-tip-value">{money(hoverDatum.revenue)}</span>
          <span className="ov-chart-tip-orders">{hoverDatum.orders} orders</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ 行内小图标 -------------------------------- */

const iconClock = (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="5.6" stroke="currentColor" strokeWidth="1.2" />
    <path
      d="M7.5 4.6v3.1l2.1 1.3"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const iconBox = (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M2.2 4.9 7.5 2.2l5.3 2.7v5.2l-5.3 2.7-5.3-2.7V4.9Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="M2.2 4.9 7.5 7.6l5.3-2.7M7.5 7.6v5.2"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

const iconReturn = (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M5.4 3.2 2.6 6l2.8 2.8"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.6 6h6.1a3.6 3.6 0 0 1 0 7.2H6.2"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* -------------------------------- 页面本体 -------------------------------- */

export function Overview() {
  const [range, setRange] = useState<RangeKey>('30');
  const chartPoints = revenueSeries.slice(-Number(range));
  const digest = digestOf(chartPoints);

  // 假导出:toast.promise 走完 loading → success 三态
  const handleExport = () => {
    toast.promise(
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, 1400);
      }),
      {
        loading: 'Preparing export…',
        success: `Overview (last ${range} days) exported as CSV`,
        error: 'Export failed — please try again',
      },
    );
  };

  return (
    <div className="ad-content">
      <header className="ad-page-header">
        <div>
          <span className="sf-kicker sf-kicker-dot ov-eyebrow">Arden Studio · store</span>
          <h1 className="ad-page-title">Overview</h1>
          <p className="ad-page-sub">Last {range} days · ending Aug 3, 2026</p>
        </div>
        <div className="ad-page-actions">
          <Select
            className="ov-range-select"
            size="sm"
            options={RANGE_OPTIONS}
            value={range}
            onChange={(next) => setRange(next as RangeKey)}
            aria-label="Chart time range"
          />
          <Button variant="ghost" size="sm" onClick={handleExport}>
            Export
          </Button>
        </div>
      </header>

      {/* ① KPI 带:1.5fr/1fr/1fr/1fr,首块主色满色块 —— 数值中性,语义色只留给趋势行 */}
      <div className="ad-kpis">
        <div className="ad-kpi ad-kpi-lead ov-kpi">
          <Statistic
            title="Revenue"
            value={overviewStats.revenue30d}
            prefix="$"
            animateOnMount
            classNames={{ title: 'ad-kpi-k', value: 'ad-kpi-v' }}
          />
          <span className="ad-kpi-d">+12.4% vs prior period</span>
        </div>
        <div className="ad-kpi ov-kpi">
          <Statistic
            title="Orders"
            value={overviewStats.orders30d}
            animateOnMount
            classNames={{ title: 'ad-kpi-k', value: 'ad-kpi-v' }}
          />
          <span className="ad-kpi-d ad-kpi-d-up">+9.1%</span>
        </div>
        <div className="ad-kpi ov-kpi">
          <Statistic
            title="Avg order"
            value={overviewStats.aov}
            prefix="$"
            animateOnMount
            classNames={{ title: 'ad-kpi-k', value: 'ad-kpi-v' }}
          />
          <span className="ad-kpi-d ad-kpi-d-up">+2.8%</span>
        </div>
        <div className="ad-kpi ov-kpi">
          <Statistic
            title="Repeat rate"
            value={Math.round(overviewStats.repeatRate * 100)}
            suffix="%"
            animateOnMount
            classNames={{ title: 'ad-kpi-k', value: 'ad-kpi-v' }}
          />
          <span className="ad-kpi-d ad-kpi-d-dn">−1.9 pts</span>
        </div>
      </div>

      {/* ② 收入行:左边密集的墨色摘要,右边留白的面积图 —— 密度反差 */}
      <div className="ov-chart-row">
        <aside className="ad-card ov-digest">
          <span className="ad-kpi-k">Peak day</span>
          <p className="ov-digest-v">{digest.peak ? money(digest.peak.revenue) : '—'}</p>
          <p className="ov-digest-meta">
            {digest.peak ? `${shortDate(digest.peak.date)} · ${digest.peak.orders} orders` : '—'}
          </p>
          <div className="ov-digest-rows">
            <span className="ov-digest-row">
              <i className="sf-index">Avg / day</i>
              <b>{money(digest.avg)}</b>
            </span>
            <span className="ov-digest-row">
              <i className="sf-index">Slowest</i>
              <b>{digest.low ? money(digest.low.revenue) : '—'}</b>
            </span>
            <span className="ov-digest-row">
              <i className="sf-index">Orders</i>
              <b>{digest.orders}</b>
            </span>
            <span className="ov-digest-row">
              <i className="sf-index">Days</i>
              <b>{chartPoints.length}</b>
            </span>
            <span className="ov-digest-row">
              <i className="sf-index">Range total</i>
              <b>{money(digest.total)}</b>
            </span>
          </div>
        </aside>

        <section className="ad-card ov-chart-card">
          <div className="ov-card-head">
            <h2 className="ad-card-title">Revenue</h2>
            <span className="ov-legend">
              <i className="ov-legend-dot" aria-hidden="true" />
              Daily
              <span className="ov-legend-muted">· USD</span>
            </span>
          </div>
          <RevenueChart points={chartPoints} />
        </section>
      </div>

      {/* ③ 底部:1.85fr 表格 / 1fr 两块清单 */}
      <div className="ad-split">
        <section className="ad-card ov-orders">
          <div className="ov-card-head">
            <h2 className="ad-card-title">Recent orders</h2>
            <span className="sf-index">
              {RECENT_ORDERS.length} / {orders.length}
            </span>
          </div>
          <Table<Order>
            columns={ORDER_COLUMNS}
            data={RECENT_ORDERS}
            size="sm"
            hoverable
            getRowKey={(row) => row.id}
            onRowClick={() => navigate('/admin/orders')}
          />
          <div className="ov-card-foot">
            <RouterLink to="/admin/orders" className="ov-card-link">
              View all orders →
            </RouterLink>
          </div>
        </section>

        <div className="ov-side">
          {/* 待处理:左侧色条编码 —— 语义色标严重度,品类色标是哪一类在缺货 */}
          <section className="ad-card">
            <div className="ov-card-head">
              <h2 className="ad-card-title">Needs attention</h2>
              <span className="sf-index">{ATTENTION_ROWS} items</span>
            </div>
            <List
              marker="none"
              spacing="none"
              className="ad-attn ov-attn-list"
              classNames={{ item: 'ov-attn-item' }}
            >
              <List.Item>
                <RouterLink to="/admin/orders" className="ad-attn-row ov-attn-row ov-attn-warn">
                  <span className="ov-attn-icon">{iconClock}</span>
                  <span className="ov-attn-label">Orders awaiting payment</span>
                  <span className="ad-attn-n">{PENDING_COUNT}</span>
                </RouterLink>
              </List.Item>
              {LOW_STOCK.map((product) => (
                <List.Item key={product.id}>
                  <RouterLink
                    to="/admin/products"
                    className="ad-attn-row ov-attn-row"
                    data-cat={product.category}
                  >
                    <span className="ov-attn-icon">{iconBox}</span>
                    <span className="ov-attn-label">{product.name}</span>
                    {/* 色条编码品类,药丸编码严重度 —— 两套颜色各管一件事 */}
                    <Tag size="sm" tone={product.stock < 10 ? 'danger' : 'warning'}>
                      {product.stock} left
                    </Tag>
                  </RouterLink>
                </List.Item>
              ))}
              <List.Item>
                <RouterLink to="/admin/orders" className="ad-attn-row ov-attn-row ov-attn-danger">
                  <span className="ov-attn-icon">{iconReturn}</span>
                  <span className="ov-attn-label">Refund requests to review</span>
                  <span className="ad-attn-n">{REFUND_COUNT}</span>
                </RouterLink>
              </List.Item>
            </List>
          </section>

          {/* 热销榜:等宽序号 + 品类色点 + Progress 占比 */}
          <section className="ad-card">
            <div className="ov-card-head">
              <h2 className="ad-card-title">Top products</h2>
              <span className="sf-index">Share of lines</span>
            </div>
            <ol className="ov-top-list">
              {TOP_PRODUCTS.map(({ product, share }, i) => (
                <li key={product.id} className="ov-top-row" data-cat={product.category}>
                  <span className="sf-index ov-top-rank">{String(i + 1).padStart(2, '0')}</span>
                  <span className="sf-dot sf-cat-dot" aria-hidden="true" />
                  <span className="ov-top-name">{product.name}</span>
                  <Progress
                    value={share}
                    size="sm"
                    aria-label={`${product.name}: ${share}% of order lines`}
                  />
                  <span className="ov-top-share">{share}%</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
