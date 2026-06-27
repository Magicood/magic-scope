import { Badge, Code, Input, Pagination, Table, Tag, Text } from '@magic-scope/react';
import { type ChangeEvent, useMemo, useState } from 'react';
import { type EventRow, eventRows } from '../data/content';

const PAGE_SIZE = 5;

type StatusTone = 'success' | 'warning' | 'danger';

const statusMeta: Record<EventRow['status'], { tone: StatusTone; label: string }> = {
  success: { tone: 'success', label: '成功' },
  warning: { tone: 'warning', label: '警告' },
  failed: { tone: 'danger', label: '失败' },
};

const numberFormatter = new Intl.NumberFormat('en-US');

const columns = [
  {
    key: 'name',
    header: '事件名',
    render: (row: EventRow) => (
      <Code variant="ghost" tone="neutral" size="sm">
        {row.name}
      </Code>
    ),
  },
  {
    key: 'user',
    header: '用户',
    render: (row: EventRow) => (
      <Text
        size="sm"
        style={{
          color: 'var(--ms-color-fg-muted)',
          overflowWrap: 'anywhere',
        }}
      >
        {row.user}
      </Text>
    ),
  },
  {
    key: 'source',
    header: '来源',
    render: (row: EventRow) => (
      <Badge variant="soft" tone="neutral" size="sm">
        {row.source}
      </Badge>
    ),
  },
  {
    key: 'status',
    header: '状态',
    render: (row: EventRow) => {
      const meta = statusMeta[row.status];
      return (
        <Tag variant="soft" tone={meta.tone} size="sm">
          {meta.label}
        </Tag>
      );
    },
  },
  {
    key: 'count',
    header: '次数',
    align: 'end' as const,
    render: (row: EventRow) => (
      <Text size="sm" numeric="tabular">
        {numberFormatter.format(row.count)}
      </Text>
    ),
  },
  {
    key: 'time',
    header: '时间',
    align: 'end' as const,
    render: (row: EventRow) => (
      <Text size="sm" style={{ color: 'var(--ms-color-fg-subtle)' }}>
        {row.time}
      </Text>
    ),
  },
];

export function EventsTable() {
  const [query, setQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const filtered = useMemo<EventRow[]>(() => {
    const term = query.trim().toLowerCase();
    if (term === '') {
      return eventRows;
    }
    return eventRows.filter((row) => row.name.toLowerCase().includes(term));
  }, [query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setPage(1);
  };

  return (
    <div
      className="v-panel"
      style={{
        display: 'grid',
        gap: 'var(--ms-space-5)',
        padding: 'var(--ms-space-6)',
        minInlineSize: 0,
      }}
    >
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--ms-space-3)',
        }}
      >
        <Text as="h2" size="lg" weight="semibold" style={{ minInlineSize: 0 }}>
          最近事件
        </Text>
        <Input
          size="sm"
          value={query}
          onChange={handleQueryChange}
          clearable
          onClear={() => {
            setQuery('');
            setPage(1);
          }}
          placeholder="搜索事件名"
          aria-label="搜索事件名"
          style={{ inlineSize: 'min(16rem, 100%)' }}
        />
      </header>

      <div style={{ overflowX: 'auto', minInlineSize: 0 }}>
        <Table
          columns={columns}
          data={pageRows}
          size="sm"
          hoverable
          tone="primary"
          empty={
            <Text size="sm" style={{ color: 'var(--ms-color-fg-muted)' }}>
              没有匹配的事件
            </Text>
          }
          style={{ inlineSize: '100%' }}
        />
      </div>

      <footer
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--ms-space-3)',
        }}
      >
        <Text size="sm" style={{ color: 'var(--ms-color-fg-subtle)' }}>
          共 {filtered.length} 条事件
        </Text>
        <Pagination page={safePage} total={pageCount} size="sm" onPageChange={setPage} />
      </footer>
    </div>
  );
}
