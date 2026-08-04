import {
  AlertDialogHost,
  Avatar,
  Button,
  ContextMenu,
  CopyButton,
  confirm,
  DatePicker,
  type DatePreset,
  type DateRange,
  Descriptions,
  Drawer,
  Dropdown,
  type DropdownItem,
  Empty,
  HoverCard,
  Input,
  type MentionOption,
  Mentions,
  type MenuItem,
  Pagination,
  type RowKey,
  Segmented,
  Select,
  type SelectOption,
  type SortState,
  Table,
  type TableColumn,
  Tag,
  type TagTone,
  Timeline,
  TimelineItem,
  Toolbar,
  toast,
} from '@magic-scope/react';
import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { getCustomer } from '../data/customers';
import { orders as seedOrders } from '../data/orders';
import { getProduct } from '../data/products';
import type { CustomerTier, Order, OrderEvent, OrderStatus } from '../data/types';
import { formatDate, formatDateTime, money } from '../lib/format';
import './Orders.css';

/* ============================================================================
 * Orders —— 后台订单页(Table 全功能主战场)。
 * 数据以 data/orders.ts 为种子进本地 state,一切状态变更(发货/配货/退款/备注)
 * 都真实写回本地数据;筛选(Segmented × Select × 搜索 × 日期区间)全部受控。
 * ========================================================================== */

const PAGE_SIZE = 10;

/* ------------------------------ 状态语义 ---------------------------------- */

const STATUS_META: Record<OrderStatus, { label: string; tone: TagTone }> = {
  pending: { label: 'Pending', tone: 'warning' },
  paid: { label: 'Paid', tone: 'info' },
  fulfilled: { label: 'Fulfilled', tone: 'accent' },
  shipped: { label: 'Shipped', tone: 'primary' },
  delivered: { label: 'Delivered', tone: 'success' },
  refunded: { label: 'Refunded', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

const ORDER_STATUSES: readonly OrderStatus[] = [
  'pending',
  'paid',
  'fulfilled',
  'shipped',
  'delivered',
  'refunded',
  'cancelled',
];

type SegmentKey = 'all' | 'open' | 'shipped' | 'delivered' | 'closed';

const SEGMENTS: ReadonlyArray<{ value: SegmentKey; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'closed', label: 'Closed' },
];

const SEGMENT_STATUSES: Record<Exclude<SegmentKey, 'all'>, readonly OrderStatus[]> = {
  open: ['pending', 'paid', 'fulfilled'],
  shipped: ['shipped'],
  delivered: ['delivered'],
  closed: ['refunded', 'cancelled'],
};

/** 单个状态归属的快切段(Select 与 Segmented 双向联动用)。 */
function segmentOf(status: OrderStatus): Exclude<SegmentKey, 'all'> {
  switch (status) {
    case 'pending':
    case 'paid':
    case 'fulfilled':
      return 'open';
    case 'shipped':
      return 'shipped';
    case 'delivered':
      return 'delivered';
    case 'refunded':
    case 'cancelled':
      return 'closed';
  }
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All statuses' },
  ...ORDER_STATUSES.map((s) => ({ value: s, label: STATUS_META[s].label })),
];

/* mock 数据窗口固定在 2026-06 ~ 08,预设区间同样钉死,不随真实"今天"漂移 */
const DATE_PRESETS: DatePreset[] = [
  { label: 'June 2026', range: { start: new Date(2026, 5, 1), end: new Date(2026, 5, 30) } },
  { label: 'July 2026', range: { start: new Date(2026, 6, 1), end: new Date(2026, 6, 31) } },
  { label: 'August 2026', range: { start: new Date(2026, 7, 1), end: new Date(2026, 7, 31) } },
];

const TIER_META: Record<CustomerTier, { label: string; tone: TagTone }> = {
  new: { label: 'New', tone: 'info' },
  member: { label: 'Member', tone: 'neutral' },
  vip: { label: 'VIP', tone: 'accent' },
};

/** 内部备注可 @ 的店员(Mentions 候选)。 */
const STAFF: MentionOption[] = [
  { value: 'ava-martin', label: 'Ava Martin' },
  { value: 'noah-chen', label: 'Noah Chen' },
  { value: 'mia-ito', label: 'Mia Ito' },
];

/* ------------------------------ 状态机 ------------------------------------ */

const canShip = (o: Order) => o.status === 'paid' || o.status === 'fulfilled';
const canFulfill = (o: Order) => o.status === 'paid';
const canRefund = (o: Order) => o.status !== 'refunded' && o.status !== 'cancelled';

/** 发货:已排定的履约节点(Packed/Shipped)置为完成,Delivered 仍是预计。 */
function shipOrder(o: Order): Order {
  return {
    ...o,
    status: 'shipped',
    timeline: o.timeline.map((ev) => (ev.label === 'Delivered' ? ev : { ...ev, done: true })),
  };
}

/** 配货完成:Packed 节点置为完成(仅 paid 可达)。 */
function fulfillOrder(o: Order): Order {
  return {
    ...o,
    status: 'fulfilled',
    timeline: o.timeline.map((ev) => (ev.label === 'Packed' ? { ...ev, done: true } : ev)),
  };
}

function refundOrder(o: Order): Order {
  return { ...o, status: 'refunded' };
}

const pluralOrders = (n: number) => `${n} ${n === 1 ? 'order' : 'orders'}`;

/** 时间线节点语义色:退款/取消恒 danger;完成 success;下一站 primary;其余待办 neutral。 */
function eventVariant(
  ev: OrderEvent,
  isNext: boolean,
): 'success' | 'danger' | 'primary' | 'neutral' {
  if (ev.label === 'Cancelled' || ev.label === 'Refund issued') return 'danger';
  if (ev.done) return 'success';
  return isNext ? 'primary' : 'neutral';
}

/* ------------------------------- 图标 ------------------------------------- */

const iconSearch = (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="6.7" cy="6.7" r="4.2" stroke="currentColor" strokeWidth="1.2" />
    <path d="m9.9 9.9 3.2 3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const iconDots = (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="currentColor" aria-hidden="true">
    <circle cx="3.1" cy="7.5" r="1.1" />
    <circle cx="7.5" cy="7.5" r="1.1" />
    <circle cx="11.9" cy="7.5" r="1.1" />
  </svg>
);

const iconExport = (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M7.5 2.2v7.1m0 0 2.6-2.6M7.5 9.3 4.9 6.7"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.6 10.6v1.2c0 .55.45 1 1 1h7.8c.55 0 1-.45 1-1v-1.2"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

/* --------------------------- 客户悬浮预览单元格 ----------------------------- */

function CustomerCell({ customerId }: { customerId: string }) {
  const customer = getCustomer(customerId);
  if (!customer) return <span>—</span>;
  const tier = TIER_META[customer.tier];
  return (
    <HoverCard openDelay={350} closeDelay={150}>
      <HoverCard.Trigger>
        <span className="od-customer">{customer.name}</span>
      </HoverCard.Trigger>
      <HoverCard.Content placement="bottom-start" className="od-customer-card" data-od-stop="">
        <div className="od-customer-top">
          <Avatar name={customer.name} size="sm" />
          <span className="od-customer-idty">
            <strong>{customer.name}</strong>
            <span>{customer.email}</span>
          </span>
          <Tag size="sm" tone={tier.tone}>
            {tier.label}
          </Tag>
        </div>
        <dl className="od-customer-stats">
          <div>
            <dt>Orders</dt>
            <dd>{customer.orders}</dd>
          </div>
          <div>
            <dt>Spent</dt>
            <dd>{money(customer.spent)}</dd>
          </div>
          <div>
            <dt>Since</dt>
            <dd>{formatDate(customer.joinedAt)}</dd>
          </div>
        </dl>
      </HoverCard.Content>
    </HoverCard>
  );
}

/* -------------------------------- 页面 ------------------------------------ */

export function Orders() {
  /* 本地数据副本:状态变更(发货/退款/备注)真实写回这里 */
  const [rows, setRows] = useState<Order[]>(seedOrders);

  /* 首次进入假加载 400ms:空数据 + loading 触发 Table 骨架行 */
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 400);
    return () => window.clearTimeout(timer);
  }, []);

  /* 筛选四件套(互相联动,任何变化都归第 1 页) */
  const [segment, setSegment] = useState<SegmentKey>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [range, setRange] = useState<DateRange>({ start: null, end: null });

  /* 表格交互态 */
  const [sortState, setSortState] = useState<SortState | null>({
    columnKey: 'placedAt',
    direction: 'desc',
  });
  const [selectedKeys, setSelectedKeys] = useState<RowKey[]>([]);
  const [page, setPage] = useState(1);

  /* 右键菜单目标行:ref 记录"本次 contextmenu 事件是否落在数据行上" */
  const [ctxRow, setCtxRow] = useState<Order | null>(null);
  const ctxEventRef = useRef<Event | null>(null);

  /* 详情抽屉 */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const active = activeId ? rows.find((o) => o.id === activeId) : undefined;

  /* ------------------------------ 派生数据 -------------------------------- */

  const counts = useMemo(() => {
    const bySegment: Record<SegmentKey, number> = {
      all: rows.length,
      open: 0,
      shipped: 0,
      delivered: 0,
      closed: 0,
    };
    for (const o of rows) bySegment[segmentOf(o.status)] += 1;
    return bySegment;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const startMs = range.start ? range.start.getTime() : null;
    /* end 含当日:右开区间到次日 0 点 */
    const endMs = range.end ? range.end.getTime() + 86_400_000 : null;
    return rows.filter((o) => {
      if (statusFilter !== 'all') {
        if (o.status !== statusFilter) return false;
      } else if (segment !== 'all' && !SEGMENT_STATUSES[segment].includes(o.status)) {
        return false;
      }
      if (q) {
        const name = getCustomer(o.customerId)?.name.toLowerCase() ?? '';
        if (!o.number.toLowerCase().includes(q) && !name.includes(q)) return false;
      }
      const placed = Date.parse(o.placedAt);
      if (startMs !== null && placed < startMs) return false;
      if (endMs !== null && placed >= endMs) return false;
      return true;
    });
  }, [rows, segment, statusFilter, query, range]);

  /* sortState 受控 → 组件不再内排,这里自己排好再传 */
  const sorted = useMemo(() => {
    if (!sortState) return filtered;
    const dir = sortState.direction === 'asc' ? 1 : -1;
    const key = sortState.columnKey;
    const copy = [...filtered];
    copy.sort((a, b) => {
      if (key === 'total') return (a.total - b.total) * dir;
      if (key === 'placedAt') return (Date.parse(a.placedAt) - Date.parse(b.placedAt)) * dir;
      return 0;
    });
    return copy;
  }, [filtered, sortState]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = useMemo(
    () => sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [sorted, safePage],
  );

  const selectedOrders = useMemo(
    () => rows.filter((o) => selectedKeys.includes(o.id)),
    [rows, selectedKeys],
  );

  /* ------------------------------ 筛选联动 -------------------------------- */

  const handleSegment = (value: string) => {
    setSegment(value as SegmentKey);
    setStatusFilter('all');
    setPage(1);
  };

  const handleStatus = (value: string | string[]) => {
    const next = value as OrderStatus | 'all';
    setStatusFilter(next);
    setSegment(next === 'all' ? 'all' : segmentOf(next));
    setPage(1);
  };

  const handleRange = (next: DateRange) => {
    setRange(next);
    setPage(1);
  };

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setSegment('all');
    setRange({ start: null, end: null });
    setPage(1);
  };

  /* ------------------------------ 业务动作 -------------------------------- */

  const openDrawer = (order: Order) => {
    setActiveId(order.id);
    setNoteDraft(order.note ?? '');
    setDrawerOpen(true);
  };

  const copyNumber = (order: Order) => {
    navigator.clipboard
      .writeText(order.number)
      .then(() => toast.success(`${order.number} copied to clipboard`))
      .catch(() => toast.error('Could not copy — clipboard unavailable'));
  };

  const markShipped = (ids: string[]) => {
    const targets = rows.filter((o) => ids.includes(o.id) && canShip(o));
    if (targets.length === 0) return;
    setRows((prev) => prev.map((o) => (ids.includes(o.id) && canShip(o) ? shipOrder(o) : o)));
    const first = targets[0];
    toast.success(
      targets.length === 1 && first
        ? `${first.number} marked as shipped`
        : `${pluralOrders(targets.length)} marked as shipped`,
    );
  };

  const bulkFulfill = () => {
    const targets = selectedOrders.filter(canFulfill);
    if (targets.length === 0) {
      toast('Nothing to fulfill', {
        description: 'Only paid orders can move to fulfilled.',
      });
      return;
    }
    const ids = new Set(targets.map((o) => o.id));
    setRows((prev) => prev.map((o) => (ids.has(o.id) ? fulfillOrder(o) : o)));
    setSelectedKeys([]);
    toast.success(`${pluralOrders(targets.length)} marked fulfilled`);
  };

  const bulkRefund = async () => {
    const targets = selectedOrders.filter(canRefund);
    if (targets.length === 0) {
      toast('Nothing to refund', { description: 'Selected orders are already closed.' });
      return;
    }
    const ok = await confirm(
      `Refund ${pluralOrders(targets.length)}? Payments return to the original method.`,
      { title: 'Refund orders', variant: 'danger', confirmText: 'Refund' },
    );
    if (!ok) return;
    const ids = new Set(targets.map((o) => o.id));
    setRows((prev) => prev.map((o) => (ids.has(o.id) ? refundOrder(o) : o)));
    setSelectedKeys([]);
    toast.success(`${pluralOrders(targets.length)} refunded`);
  };

  const saveNote = () => {
    if (!activeId) return;
    const trimmed = noteDraft.trim();
    setRows((prev) =>
      prev.map((o) => {
        if (o.id !== activeId) return o;
        if (!trimmed) {
          const { note: _drop, ...rest } = o;
          return rest;
        }
        return { ...o, note: trimmed };
      }),
    );
    toast.success('Note saved');
  };

  const exportCsv = () => {
    const count = sorted.length;
    toast.promise(
      new Promise<number>((resolve) => {
        window.setTimeout(() => resolve(count), 900);
      }),
      {
        loading: 'Preparing CSV export…',
        success: (n) => `Exported ${pluralOrders(n)}`,
        error: 'Export failed — try again',
      },
    );
  };

  /* ---------------------------- 表格列与菜单 ------------------------------- */

  const rowActions = (order: Order): DropdownItem[] => [
    { label: 'View details', onSelect: () => openDrawer(order) },
    { label: 'Copy number', onSelect: () => copyNumber(order) },
    { type: 'separator' },
    {
      label: 'Mark as shipped',
      disabled: !canShip(order),
      onSelect: () => markShipped([order.id]),
    },
  ];

  const ctxItems: MenuItem[] = ctxRow
    ? [
        { label: 'View details', onSelect: () => openDrawer(ctxRow) },
        { label: 'Copy number', onSelect: () => copyNumber(ctxRow) },
        { type: 'separator' },
        {
          label: 'Mark as shipped',
          disabled: !canShip(ctxRow),
          onSelect: () => markShipped([ctxRow.id]),
        },
      ]
    : [];

  const columns: TableColumn<Order>[] = [
    {
      key: 'number',
      header: 'Order',
      width: 96,
      render: (o) => <span className="od-number">{o.number}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (o) => <CustomerCell customerId={o.customerId} />,
    },
    {
      key: 'items',
      header: 'Items',
      align: 'end',
      width: 64,
      render: (o) => <span className="od-num">{o.items.reduce((sum, it) => sum + it.qty, 0)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: 116,
      render: (o) => (
        <Tag size="sm" tone={STATUS_META[o.status].tone}>
          {STATUS_META[o.status].label}
        </Tag>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      align: 'end',
      width: 96,
      sortable: true,
      render: (o) => <span className="od-num">{money(o.total)}</span>,
    },
    {
      key: 'placedAt',
      header: 'Placed',
      width: 150,
      sortable: true,
      render: (o) => <span className="od-date">{formatDateTime(o.placedAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'end',
      width: 52,
      render: (o) => (
        /* data-od-stop:菜单(popover 仍在行 DOM 内)里的点击不当作行点击 */
        <span data-od-stop="">
          <Dropdown
            placement="bottom-end"
            trigger={
              <Button variant="ghost" size="sm" iconOnly aria-label={`Actions for ${o.number}`}>
                {iconDots}
              </Button>
            }
            items={rowActions(o)}
          />
        </span>
      ),
    },
  ];

  const nextEventIndex = active ? active.timeline.findIndex((ev) => !ev.done) : -1;
  const activeCustomer = active ? getCustomer(active.customerId) : undefined;

  /* -------------------------------- 渲染 ---------------------------------- */

  return (
    <div className="ad-content">
      {/* confirm() 的渲染容器(App 根未挂,本页自挂一次) */}
      <AlertDialogHost />

      <header className="ad-page-header">
        <div>
          <h1 className="ad-page-title">Orders</h1>
          <p className="ad-page-sub">{rows.length} orders in the last 60 days</p>
        </div>
        <div className="ad-page-actions">
          <Button variant="ghost" leftIcon={iconExport} onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </header>

      <Segmented
        className="od-segments"
        aria-label="Quick filter by order state"
        value={statusFilter === 'all' ? segment : segmentOf(statusFilter)}
        onValueChange={handleSegment}
        options={SEGMENTS.map((s) => ({
          value: s.value,
          label: (
            <span className="od-seg-opt">
              {s.label}
              <span className="od-seg-count">{counts[s.value]}</span>
            </span>
          ),
        }))}
      />

      <section className="ad-card od-table-card" aria-label="Orders table">
        <Toolbar className="ad-toolbar od-toolbar" size="sm" aria-label="Order filters">
          <Input
            className="od-search"
            size="sm"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search order or customer"
            prefix={iconSearch}
            clearable
            aria-label="Search by order number or customer"
          />
          <Select
            className="od-status-select"
            size="sm"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={handleStatus}
            aria-label="Filter by status"
          />
          {/* locale 钉死 en-US:站点文案为英文,不随浏览器语言漂移 */}
          <DatePicker
            className="od-daterange"
            size="sm"
            mode="range"
            locale="en-US"
            rangeValue={range}
            onRangeChange={handleRange}
            presets={DATE_PRESETS}
            placeholder="Placed between"
          />
          <div className="ad-toolbar-spacer" />
          <Toolbar.Button onClick={resetFilters}>Reset</Toolbar.Button>
        </Toolbar>

        {selectedKeys.length > 0 && (
          <div className="od-bulkbar">
            <span className="od-bulk-count">{selectedKeys.length} selected</span>
            <Button size="sm" variant="soft" onClick={bulkFulfill}>
              Mark fulfilled
            </Button>
            <Button size="sm" variant="soft" tone="danger" onClick={() => void bulkRefund()}>
              Refund…
            </Button>
            <span className="ad-toolbar-spacer" />
            <Button size="sm" variant="ghost" onClick={() => setSelectedKeys([])}>
              Clear
            </Button>
          </div>
        )}

        <ContextMenu
          items={ctxItems}
          onContextMenu={(e) => {
            /* 只有落在数据行上的右键(onRowContextMenu 已记录同一事件)才开菜单 */
            if (ctxEventRef.current !== e.nativeEvent) e.preventDefault();
          }}
        >
          <Table<Order>
            className="od-table"
            columns={columns}
            data={booting ? [] : paged}
            getRowKey={(o) => o.id}
            hoverable
            stickyHeader
            maxHeight={560}
            sortState={sortState}
            onSortChange={(next) => {
              setSortState(next);
              setPage(1);
            }}
            rowSelection={{
              selectedKeys,
              onChange: (keys) => setSelectedKeys(keys),
              getCheckboxProps: (o) => ({ 'aria-label': `Select ${o.number}` }),
              columnWidth: 40,
            }}
            onRowClick={(o, _i, e) => {
              /* 行内浮层(HoverCard 卡片 / 行菜单)里的点击不触发详情 */
              if ((e.target as HTMLElement).closest('[data-od-stop]')) return;
              openDrawer(o);
            }}
            onRowContextMenu={(o, _i, e) => {
              ctxEventRef.current = e.nativeEvent;
              setCtxRow(o);
            }}
            loading={booting}
            skeletonRows={8}
            empty={
              <Empty image="simple" description="No orders match the current filters">
                <Button size="sm" variant="ghost" onClick={resetFilters}>
                  Reset filters
                </Button>
              </Empty>
            }
          />
        </ContextMenu>

        <footer className="od-table-foot">
          <Pagination
            page={safePage}
            onPageChange={setPage}
            totalItems={sorted.length}
            pageSize={PAGE_SIZE}
            showSizeChanger={false}
            size="sm"
            showTotal={(total, [from, to]) =>
              total === 0 ? 'No orders' : `${from}–${to} of ${total} orders`
            }
          />
        </footer>
      </section>

      {active && (
        <Drawer
          open={drawerOpen}
          onOpenChange={(next) => {
            if (!next) setDrawerOpen(false);
          }}
          side="end"
          className="od-drawer"
          aria-label={`Order ${active.number}`}
          header={
            <div className="od-drawer-head">
              <div className="od-drawer-titlerow">
                <h2 className="od-drawer-number">{active.number}</h2>
                {/* withTooltip 关闭:Tooltip 锚定在 top-layer 抽屉内会退化到视口原点 */}
                <CopyButton
                  value={active.number}
                  size="sm"
                  variant="ghost"
                  withTooltip={false}
                  aria-label="Copy order number"
                />
                <Tag size="sm" tone={STATUS_META[active.status].tone}>
                  {STATUS_META[active.status].label}
                </Tag>
                <span className="od-drawer-spacer" />
                <Button
                  size="sm"
                  disabled={!canShip(active)}
                  onClick={() => markShipped([active.id])}
                >
                  Mark as shipped
                </Button>
              </div>
              <p className="od-drawer-sub">
                Placed {formatDateTime(active.placedAt)} · {activeCustomer?.name ?? 'Guest'}
              </p>
            </div>
          }
        >
          <div className="od-drawer-body">
            <Descriptions
              size="sm"
              columns={2}
              items={[
                { key: 'customer', label: 'Customer', value: activeCustomer?.name ?? '—' },
                {
                  key: 'method',
                  label: 'Shipping',
                  value: active.shippingMethod === 'express' ? 'Express' : 'Standard',
                },
                { key: 'destination', label: 'Destination', value: active.destination, span: 2 },
                { key: 'placed', label: 'Placed', value: formatDateTime(active.placedAt), span: 2 },
              ]}
            />

            <section>
              <h3 className="od-section-title">Items</h3>
              <ul className="od-lines">
                {active.items.map((it) => {
                  const product = getProduct(it.productId);
                  const colorway = product?.colorways.find((c) => c.id === it.colorwayId);
                  return (
                    <li key={`${it.productId}-${it.colorwayId}`}>
                      <span
                        className="od-swatch"
                        style={
                          {
                            '--od-swatch': colorway?.swatch ?? 'var(--ms-color-border)',
                          } as CSSProperties
                        }
                        aria-hidden="true"
                      />
                      <span className="od-line-name">
                        {product?.name ?? it.productId}
                        <small>
                          {colorway?.label ?? '—'} × {it.qty}
                        </small>
                      </span>
                      <span className="od-num">{money(it.unitPrice * it.qty)}</span>
                    </li>
                  );
                })}
              </ul>
              <dl className="od-totals">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{money(active.subtotal)}</dd>
                </div>
                <div>
                  <dt>Shipping</dt>
                  <dd>{active.shipping === 0 ? 'Free' : money(active.shipping)}</dd>
                </div>
                <div className="od-grand">
                  <dt>Total</dt>
                  <dd>{money(active.total)}</dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="od-section-title">Activity</h3>
              <Timeline className="od-timeline">
                {active.timeline.map((ev, index) => (
                  <TimelineItem
                    key={`${ev.at}-${ev.label}`}
                    variant={eventVariant(ev, index === nextEventIndex)}
                    pulse={index === nextEventIndex}
                    time={ev.done ? formatDateTime(ev.at) : `Est. ${formatDateTime(ev.at)}`}
                    title={ev.label}
                  />
                ))}
              </Timeline>
            </section>

            <section>
              <h3 className="od-section-title">Internal note</h3>
              <Mentions
                value={noteDraft}
                onChange={setNoteDraft}
                options={STAFF}
                rows={3}
                placeholder="Add a note — type @ to mention a teammate"
              />
              <div className="od-note-actions">
                <Button size="sm" variant="soft" onClick={saveNote}>
                  Save note
                </Button>
              </div>
            </section>
          </div>
        </Drawer>
      )}
    </div>
  );
}
