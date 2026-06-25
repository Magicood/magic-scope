import { useState } from 'react';
import type { MenuItem } from '../../../packages/react/src/index';
import { ContextMenu } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

function Demo({ values }: { values: ControlValues }) {
  const [last, setLast] = useState('');
  const label = (values.label as string) || '在此区域右键';

  const items: MenuItem[] = [
    { label: '✦ 召唤法阵', onSelect: () => setLast('召唤法阵') },
    { label: '↻ 重铸符文', onSelect: () => setLast('重铸符文') },
    { label: '⌖ 标记目标', onSelect: () => setLast('标记目标') },
  ];
  if (values.disabledItem) {
    items.push({ label: '✕ 封印(已锁定)', disabled: true });
  }
  if (values.dangerItem) {
    items.push({ label: '🜂 解离结界', danger: true, onSelect: () => setLast('解离结界') });
  }

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'center' }}>
      <ContextMenu items={items}>
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            inlineSize: 'min(22rem, 100%)',
            blockSize: '9rem',
            padding: '1rem',
            borderRadius: 'var(--ms-radius-lg, 0.75rem)',
            border: '1px dashed var(--ms-color-border, #2a2a3a)',
            background: 'var(--ms-color-surface-muted, rgba(255,255,255,0.03))',
            color: 'var(--ms-color-fg-muted)',
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          {label}
        </div>
      </ContextMenu>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>
        {last ? `最近触发:${last}` : '右键唤出菜单,点选某项后这里会显示动作。'}
      </p>
    </div>
  );
}

export const entry: DocEntry = {
  id: 'context-menu',
  name: 'ContextMenu',
  category: 'overlay',
  summary: '右键菜单,在光标处弹出,越界自动夹回视口,portal 到 body,键盘可达。',
  description:
    '自研、零依赖。右键(contextmenu)在包裹区域内弹出,定位在光标处并在越界时自动夹回视口;浮层 portal 到 body。\n点选 / 点外 / Esc / 滚动均关闭,菜单内支持 ↑↓ / Home / End / Enter 键盘导航。复用 Menu 的 .ms-menu__item 视觉,区别于点击锚定的 Menu。',
  controls: [
    { type: 'text', prop: 'label', label: '触发区文案', default: '在此区域右键' },
    { type: 'boolean', prop: 'disabledItem', label: '含禁用项', default: true },
    { type: 'boolean', prop: 'dangerItem', label: '含危险项', default: true },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { ContextMenu } from '@magic-scope/react';

const items = [
  { label: '召唤法阵', onSelect: () => {} },
  { label: '解离结界', danger: true, onSelect: () => {} },
];

<ContextMenu items={items}>
  <div>在此区域右键</div>
</ContextMenu>`,
  props: [
    {
      name: 'items',
      type: 'MenuItem[]',
      default: '—',
      description: '菜单项列表:{ label, onSelect?, disabled?, danger? }(与 Menu 同结构)。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description: '响应右键的区域内容。',
    },
    {
      name: 'className',
      type: 'string',
      default: '—',
      description: '菜单浮层附加类名。',
    },
    {
      name: 'MenuItem.label',
      type: 'string',
      default: '—',
      description: '菜单项文本。',
    },
    {
      name: 'MenuItem.onSelect',
      type: '() => void',
      default: '—',
      description: '选中回调,点击 / Enter 触发后菜单关闭。',
    },
    {
      name: 'MenuItem.disabled',
      type: 'boolean',
      default: 'false',
      description: '是否禁用(不可聚焦、不触发)。',
    },
    {
      name: 'MenuItem.danger',
      type: 'boolean',
      default: 'false',
      description: '是否危险项(用 danger 色)。',
    },
  ],
};
