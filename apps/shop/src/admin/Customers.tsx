import {
  Avatar,
  Button,
  Descriptions,
  Drawer,
  Empty,
  HoverCard,
  Input,
  Pagination,
  Segmented,
  type SortState,
  Statistic,
  Switch,
  Table,
  type TableColumn,
  Tag,
  type TagTone,
  Timeline,
  TimelineItem,
  toast,
} from '@magic-scope/react';
import { type CSSProperties, useMemo, useState } from 'react';
import { customers } from '../data/customers';
import { orders } from '../data/orders';
import type { Customer, CustomerTier, Order, OrderStatus } from '../data/types';
import { formatDate, money } from '../lib/format';
import { navigate } from '../lib/router';
import './Customers.css';

/* ============================================================================
 * 后台客户页 —— 30 位客户的名册。
 * 版式走 Chromatic Grid 的控制台方言:不等分 KPI 行(首块主色满色 + 分层配比条)
 * → 名册面板(大号计数 + 搜索 / 分层筛选收进面板头)→ 主表(HoverCard 档案预览 /
 * 受控排序 / 本地分页)→ 行点击抽屉档案(tier 色条 + 大号姓名 + 数字块 +
 * Descriptions + 订单 + 活动时间线)。
 * 分层(tier)一律用色条编码,不用彩色药丸;mock 数据只读,订阅开关只改本地映射。
 * ========================================================================== */

const PAGE_SIZE = 10;

type TierFilter = 'all' | CustomerTier;

const TIER_ORDER: readonly CustomerTier[] = ['vip', 'member', 'new'];

const TIER_LABEL: Record<CustomerTier, string> = {
  vip: 'VIP',
  member: 'Member',
  new: 'New',
};

const STATUS_TONE: Record<OrderStatus, TagTone> = {
  pending: 'warning',
  paid: 'info',
  fulfilled: 'primary',
  shipped: 'accent',
  delivered: 'success',
  refunded: 'neutral',
  cancelled: 'danger',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  fulfilled: 'Fulfilled',
  shipped: 'Shipped',
  delivered: 'Delivered',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

/* 静态指标(数据源不变,模块级算一次):各层人数 / 平均生涯消费 */
const TIER_COUNTS: Record<CustomerTier, number> = {
  vip: customers.filter((c) => c.tier === 'vip').length,
  member: customers.filter((c) => c.tier === 'member').length,
  new: customers.filter((c) => c.tier === 'new').length,
};
const AVG_SPENT = Math.round(customers.reduce((sum, c) => sum + c.spent, 0) / customers.length);

/* 14px 放大镜(搜索框前缀,纯装饰) */
const iconSearch = (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="6.6" cy="6.6" r="4.3" stroke="currentColor" strokeWidth="1.2" />
    <path d="m10 10 3.1 3.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/* 分层色条:走控制台的 .ad-status 语言(色块编码,不是彩色药丸);
   色值由 data-tier 在 .cst-tone 作用域里派生,见 Customers.css。 */
const TierMark = ({ tier }: { tier: CustomerTier }) => (
  <span className="ad-status cst-tier cst-tone" data-tier={tier}>
    {TIER_LABEL[tier]}
  </span>
);

/* ------------------------------ 活动时间线 --------------------------------
 * 按客户数据手拼 3~4 条:入驻 → 订阅(可选)→ 首单(或历史汇总)→ VIP /
 * 复购。history 为该客户 60 天窗口内订单(升序)。 */

type ActivityVariant = 'neutral' | 'info' | 'primary' | 'accent';

interface ActivityEvent {
  key: string;
  title: string;
  time?: string;
  body: string;
  variant: ActivityVariant;
}

function buildActivity(customer: Customer, history: Order[]): ActivityEvent[] {
  const events: ActivityEvent[] = [
    {
      key: 'joined',
      title: 'Joined Arden',
      time: formatDate(customer.joinedAt),
      body: customer.location,
      variant: 'neutral',
    },
  ];
  // 订阅事件用数据源里的初始偏好(历史事实),不跟随表格里的本地开关
  if (customer.marketingOptIn) {
    events.push({
      key: 'optin',
      title: 'Opted in to marketing',
      time: formatDate(customer.joinedAt),
      body: 'Seasonal previews and studio notes.',
      variant: 'info',
    });
  }
  const first = history[0];
  const last = history[history.length - 1];
  if (first) {
    events.push({
      key: 'first-order',
      title: 'First order on record',
      time: formatDate(first.placedAt),
      body: `${first.number} · ${money(first.total)}`,
      variant: 'primary',
    });
  } else if (customer.orders > 0) {
    // 累计口径有单、但 60 天窗口内没有:给一条汇总
    events.push({
      key: 'history',
      title: 'Order history on file',
      body: `${customer.orders} orders · ${money(customer.spent)} lifetime`,
      variant: 'primary',
    });
  }
  if (customer.tier === 'vip') {
    events.push({
      key: 'vip',
      title: 'Became VIP',
      body: `${money(customer.spent)} across ${customer.orders} orders`,
      variant: 'accent',
    });
  } else if (first && last && last.id !== first.id) {
    events.push({
      key: 'repeat-order',
      title: 'Repeat order',
      time: formatDate(last.placedAt),
      body: `${last.number} · ${money(last.total)}`,
      variant: 'primary',
    });
  }
  return events.slice(0, 4);
}

/* -------------------------------- 页面本体 -------------------------------- */

export function Customers() {
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState<TierFilter>('all');
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 营销订阅本地态(数据源只读,开关只写这份映射)
  const [optIn, setOptIn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(customers.map((c) => [c.id, c.marketingOptIn])),
  );

  const optInCount = customers.filter((c) => optIn[c.id] ?? c.marketingOptIn).length;
  const optInShare = Math.round((optInCount / customers.length) * 100);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      if (tier !== 'all' && c.tier !== tier) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    });
  }, [query, tier]);

  // 排序受控(sortState 已传入,Table 不再内排):在整份筛选结果上排,再切页
  const sorted = useMemo(() => {
    if (!sortState) return filtered;
    const key = sortState.columnKey === 'orders' ? 'orders' : 'spent';
    const dir = sortState.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => (a[key] - b[key]) * dir);
  }, [filtered, sortState]);

  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selected = selectedId ? (customers.find((c) => c.id === selectedId) ?? null) : null;
  // 该客户 60 天窗口内的订单(升序;抽屉列表倒序展示)
  const selectedOrders = selected
    ? orders
        .filter((o) => o.customerId === selected.id)
        .sort((a, b) => a.placedAt.localeCompare(b.placedAt))
    : [];
  const activity = selected ? buildActivity(selected, selectedOrders) : [];

  const resetFilters = () => {
    setQuery('');
    setTier('all');
    setPage(1);
  };

  const emailCustomer = (customer: Customer) => {
    toast('Email draft started', { description: customer.email, id: 'cst-email' });
  };

  const toggleOptIn = (customer: Customer, next: boolean) => {
    setOptIn((prev) => ({ ...prev, [customer.id]: next }));
    toast(next ? 'Marketing emails on' : 'Marketing emails off', {
      description: customer.name,
      id: `cst-optin-${customer.id}`,
    });
  };

  const openProfile = (customer: Customer) => {
    setSelectedId(customer.id);
    setDrawerOpen(true);
  };

  const columns: TableColumn<Customer>[] = [
    {
      key: 'name',
      header: 'Customer',
      render: (c) => (
        <HoverCard openDelay={450} closeDelay={150}>
          <HoverCard.Trigger>
            <span className="cst-customer">
              <Avatar name={c.name} size="sm" />
              <span className="cst-customer-name">{c.name}</span>
            </span>
          </HoverCard.Trigger>
          <HoverCard.Content placement="bottom-start">
            <div className="cst-peek">
              <div className="cst-peek-head">
                <Avatar name={c.name} size="lg" />
                <div className="cst-peek-id">
                  <span className="cst-peek-name">{c.name}</span>
                  <span className="cst-peek-email">{c.email}</span>
                </div>
              </div>
              <div className="cst-figs cst-figs-sm">
                <div className="cst-fig">
                  <span className="cst-fig-n">{c.orders}</span>
                  <span className="cst-fig-k">Orders</span>
                </div>
                <div className="cst-fig cst-fig-ink">
                  <span className="cst-fig-n">{money(c.spent)}</span>
                  <span className="cst-fig-k">Lifetime</span>
                </div>
              </div>
              <dl className="cst-peek-meta">
                <div>
                  <dt>Location</dt>
                  <dd>{c.location}</dd>
                </div>
                <div>
                  <dt>Joined</dt>
                  <dd>{formatDate(c.joinedAt)}</dd>
                </div>
                <div>
                  <dt>Tier</dt>
                  <dd>
                    <TierMark tier={c.tier} />
                  </dd>
                </div>
              </dl>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={(event) => {
                  event.stopPropagation();
                  emailCustomer(c);
                }}
              >
                Email
              </Button>
            </div>
          </HoverCard.Content>
        </HoverCard>
      ),
    },
    { key: 'location', header: 'Location' },
    { key: 'orders', header: 'Orders', sortable: true, align: 'end', width: 88 },
    {
      key: 'spent',
      header: 'Spent',
      sortable: true,
      align: 'end',
      width: 104,
      cellClassName: 'cst-num',
      render: (c) => money(c.spent),
    },
    {
      key: 'tier',
      header: 'Tier',
      width: 104,
      render: (c) => <TierMark tier={c.tier} />,
    },
    {
      key: 'joinedAt',
      header: 'Joined',
      width: 120,
      render: (c) => formatDate(c.joinedAt),
    },
    {
      key: 'marketing',
      header: 'Marketing',
      align: 'end',
      width: 100,
      render: (c) => (
        // 包一层拦截冒泡:拨开关(含键盘触发的合成 click)不触发行点击抽屉
        // biome-ignore lint/a11y/useKeyWithClickEvents: 仅拦截冒泡,交互由内部 Switch 承担
        // biome-ignore lint/a11y/noStaticElementInteractions: 同上,非交互元素
        <span className="cst-switch-cell" onClick={(event) => event.stopPropagation()}>
          <Switch
            size="sm"
            checked={optIn[c.id] ?? c.marketingOptIn}
            aria-label={`Marketing emails for ${c.name}`}
            onChange={(event) => toggleOptIn(c, event.target.checked)}
          />
        </span>
      ),
    },
  ];

  return (
    <div className="ad-content">
      <header className="ad-page-header">
        <div>
          <h1 className="ad-page-title">Customers</h1>
          <p className="ad-page-sub">
            {customers.length} accounts · {optInCount} subscribed
          </p>
        </div>
      </header>

      {/* KPI 行:不等分 1.4fr 1fr 1fr,首块主色满色 + 分层配比条 */}
      <div className="ad-kpis cst-kpis">
        <div className="ad-kpi ad-kpi-lead cst-kpi-lead">
          <Statistic
            title="VIP customers"
            value={TIER_COUNTS.vip}
            animateOnMount
            classNames={{ title: 'cst-kpi-k' }}
            valueClassName="cst-kpi-num"
          />
          {/* 分层配比:超大数字旁边一份密集清单,密度反差 */}
          <div className="cst-mix">
            {TIER_ORDER.map((t) => (
              <div className="cst-mix-row" key={t}>
                <span className="cst-mix-k">{TIER_LABEL[t]}</span>
                <span
                  className="cst-mix-bar"
                  style={
                    {
                      '--cst-mix-w': `${Math.round((TIER_COUNTS[t] / customers.length) * 100)}%`,
                    } as CSSProperties
                  }
                />
                <span className="cst-mix-n">{TIER_COUNTS[t]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ad-kpi">
          <Statistic
            title="Marketing opt-in"
            value={optInShare}
            suffix="%"
            animateOnMount
            classNames={{ title: 'cst-kpi-k' }}
            valueClassName="cst-kpi-num-sm"
          />
          <div className="cst-kpi-foot">
            {/* 订阅率的量感条:与首块的配比条同一套语言 */}
            <span
              className="cst-meter"
              aria-hidden="true"
              style={{ '--cst-meter-w': `${optInShare}%` } as CSSProperties}
            />
            <p className="cst-kpi-note">
              {optInCount} of {customers.length} subscribed
            </p>
          </div>
        </div>

        <div className="ad-kpi">
          <Statistic
            title="Avg lifetime spend"
            value={AVG_SPENT}
            prefix="$"
            animateOnMount
            classNames={{ title: 'cst-kpi-k' }}
            valueClassName="cst-kpi-num-sm"
          />
          <p className="cst-kpi-note">across all accounts</p>
        </div>
      </div>

      {/* 名册面板:面板头承载大号计数 + 搜索 / 分层筛选,底下是密集表格 */}
      <section className="ad-card cst-table-card">
        <div className="cst-table-head">
          <div className="cst-table-id">
            <span className="cst-table-kicker">Directory</span>
            <span className="cst-table-count">
              {sorted.length}
              <small>/ {customers.length}</small>
            </span>
          </div>
          <div className="cst-table-tools">
            <Input
              className="cst-search"
              size="sm"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search name or email"
              prefix={iconSearch}
              clearable
              aria-label="Search customers"
            />
            <Segmented
              size="sm"
              value={tier}
              onValueChange={(value) => {
                setTier(value as TierFilter);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All' },
                { value: 'vip', label: 'VIP' },
                { value: 'member', label: 'Member' },
                { value: 'new', label: 'New' },
              ]}
            />
          </div>
        </div>

        <Table<Customer>
          columns={columns}
          data={paged}
          size="sm"
          hoverable
          getRowKey={(c) => c.id}
          sortState={sortState}
          onSortChange={setSortState}
          onRowClick={openProfile}
          empty={
            <Empty
              image="simple"
              description={
                query ? `No customers match “${query.trim()}”.` : 'No customers in this segment.'
              }
            >
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            </Empty>
          }
        />
        {sorted.length > 0 && (
          <div className="cst-table-foot">
            <Pagination
              size="sm"
              page={page}
              onPageChange={setPage}
              totalItems={sorted.length}
              pageSize={PAGE_SIZE}
              showSizeChanger={false}
              showTotal={(total, [start, end]) => `${start}–${end} of ${total}`}
            />
          </div>
        )}
      </section>

      {/* 客户档案抽屉(420px):tier 色条 + 大号姓名 → 数字块 → 基本信息 → 订单 → 时间线 */}
      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        side="end"
        tone="neutral"
        className="cst-drawer"
        aria-label={selected ? `Customer profile — ${selected.name}` : 'Customer profile'}
        header={
          selected ? (
            <div className="cst-drawer-head cst-tone" data-tier={selected.tier}>
              <span className="cst-drawer-bar" aria-hidden="true" />
              <span className="cst-drawer-meta">
                <span className="cst-drawer-tier">{TIER_LABEL[selected.tier]}</span>
                <span className="cst-drawer-id">{selected.id}</span>
              </span>
              <span className="cst-drawer-name">{selected.name}</span>
            </div>
          ) : null
        }
        footer={
          selected ? (
            <Button variant="ghost" fullWidth onClick={() => emailCustomer(selected)}>
              Email customer
            </Button>
          ) : null
        }
      >
        {selected && (
          <div className="cst-profile">
            <div className="cst-figs">
              <div className="cst-fig">
                <span className="cst-fig-n">{selected.orders}</span>
                <span className="cst-fig-k">Orders</span>
              </div>
              <div className="cst-fig cst-fig-ink">
                <span className="cst-fig-n">{money(selected.spent)}</span>
                <span className="cst-fig-k">Lifetime spend</span>
              </div>
            </div>

            <Descriptions
              size="sm"
              columns={1}
              colon={false}
              items={[
                { key: 'email', label: 'Email', value: selected.email },
                { key: 'location', label: 'Location', value: selected.location },
                { key: 'joined', label: 'Joined', value: formatDate(selected.joinedAt) },
              ]}
            />

            <section className="cst-block">
              <h3 className="cst-block-label">Orders</h3>
              {selectedOrders.length > 0 ? (
                <div className="cst-order-list">
                  {[...selectedOrders].reverse().map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      className="cst-order-row"
                      onClick={() => navigate('/admin/orders')}
                    >
                      <span className="cst-order-number">{order.number}</span>
                      <Tag size="sm" tone={STATUS_TONE[order.status]}>
                        {STATUS_LABEL[order.status]}
                      </Tag>
                      <span className="cst-order-total">{money(order.total)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="cst-block-empty">No orders in the last 60 days.</p>
              )}
            </section>

            <section className="cst-block">
              <h3 className="cst-block-label">Activity</h3>
              <Timeline className="cst-timeline">
                {activity.map((event) =>
                  event.time ? (
                    <TimelineItem
                      key={event.key}
                      variant={event.variant}
                      title={event.title}
                      time={event.time}
                    >
                      {event.body}
                    </TimelineItem>
                  ) : (
                    <TimelineItem key={event.key} variant={event.variant} title={event.title}>
                      {event.body}
                    </TimelineItem>
                  ),
                )}
              </Timeline>
            </section>
          </div>
        )}
      </Drawer>
    </div>
  );
}
