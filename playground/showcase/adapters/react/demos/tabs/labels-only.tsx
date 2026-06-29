import type { TabItem } from '@magic-scope/react';
import { Tabs } from '@magic-scope/react';
import { useState } from 'react';

// 省略 content 时不渲染 tabpanel,内容区由外部自管(此处自行渲染列表)。
const items: TabItem[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '进行中' },
  { value: 'done', label: '已完成' },
];

const buckets: Record<string, string[]> = {
  all: ['修复登录重定向', '梳理周报模板', '迁移图表组件'],
  active: ['梳理周报模板'],
  done: ['修复登录重定向', '迁移图表组件'],
};

export default function Demo() {
  const [tab, setTab] = useState('all');
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(28rem, 100%)' }}>
      <Tabs items={items} value={tab} onChange={setTab} variant="pill" />
      <ul style={{ margin: 0, paddingInlineStart: '1.2rem', color: 'var(--ms-color-fg-muted)' }}>
        {buckets[tab].map((spell) => (
          <li key={spell}>{spell}</li>
        ))}
      </ul>
    </div>
  );
}
