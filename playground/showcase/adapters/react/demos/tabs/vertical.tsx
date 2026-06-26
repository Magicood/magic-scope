import type { TabItem } from '@magic-scope/react';
import { Tabs } from '@magic-scope/react';

// orientation="vertical":竖排标签,indicator 沿块向滑动,方向键改为 ↑ / ↓。
// 同时演示 icon 前置图标与 badge 后置徽标签名特性。
const items: TabItem[] = [
  {
    value: 'arcane',
    label: 'Arcane 奥术',
    icon: <span aria-hidden="true">✦</span>,
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        奥术系主打瞬发与爆发。竖排时 indicator 沿块向(上下)平滑滑动,焦点在标签上时按 ↑ / ↓ 切换。
      </p>
    ),
  },
  {
    value: 'frost',
    label: 'Frost 冰霜',
    icon: <span aria-hidden="true">❄</span>,
    badge: <span>3</span>,
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        冰霜系以控场见长,badge 徽标可承载未读数等附加信息。
      </p>
    ),
  },
  {
    value: 'ember',
    label: 'Ember 余烬',
    icon: <span aria-hidden="true">✸</span>,
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        余烬系持续灼烧,以时间换取可观的总伤害。
      </p>
    ),
  },
];

export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(36rem, 100%)' }}>
      <Tabs items={items} defaultValue="arcane" orientation="vertical" tone="info" />
    </div>
  );
}
