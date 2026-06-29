import type { TabItem } from '@magic-scope/react';
import { Tabs } from '@magic-scope/react';
import { useState } from 'react';

const items: TabItem[] = [
  {
    value: 'overview',
    label: 'Overview 概览',
    content: <p style={{ margin: 0 }}>概览:进度、成员与关键指标一览。</p>,
  },
  {
    value: 'activity',
    label: 'Activity 活动',
    content: <p style={{ margin: 0 }}>活动:最近的变更与评论。</p>,
  },
  {
    value: 'settings',
    label: 'Settings 设置',
    content: <p style={{ margin: 0 }}>设置:偏好、通知与权限。</p>,
  },
  {
    value: 'billing',
    label: 'Billing 计费',
    disabled: true,
    content: <p style={{ margin: 0 }}>升级套餐后可用。</p>,
  },
];

export default function Demo() {
  const [value, setValue] = useState('activity');
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(32rem, 100%)' }}>
      <Tabs items={items} value={value} onChange={setValue} />
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前受控选中:<code>{value}</code>(计费项 disabled,方向键会跳过它)。
      </p>
    </div>
  );
}
