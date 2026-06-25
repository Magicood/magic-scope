import type { CardVariant } from '../../../packages/react/src/index';
import { Card } from '../../../packages/react/src/index';
import type { DocEntry } from '../types';

export const entry: DocEntry = {
  id: 'card',
  name: 'Card',
  category: 'layout',
  summary: '内容卡片容器,elevated(底+柔影)与 outline(描边)两种变体,可选 interactive 上浮发光。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nelevated 用 surface 底配柔和阴影,outline 用透明底配描边。\ninteractive 时 hover 上浮并带奥术发光,并补 focus-visible 聚焦环与 tabIndex,尊重 reduced-motion。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'elevated',
      options: [
        { value: 'elevated', label: 'elevated 浮起' },
        { value: 'outline', label: 'outline 描边' },
      ],
    },
    { type: 'boolean', prop: 'interactive', label: '可交互 interactive', default: false },
  ],
  render: (v) => (
    <Card
      variant={v.variant as CardVariant}
      interactive={v.interactive as boolean}
      style={{ maxWidth: '20rem', padding: '1.25rem' }}
    >
      <h3 style={{ marginBlockStart: 0, marginBlockEnd: '0.5rem' }}>奥术卷轴 ✦</h3>
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        卡片是承载内容的最小容器:标题、描述与操作可自由组合。
        {v.interactive ? '当前可交互,试试悬停或用键盘聚焦。' : '开启 interactive 体验上浮与发光。'}
      </p>
    </Card>
  ),
  usage: `import { Card } from '@magic-scope/react';

<Card variant="elevated" interactive>
  <h3>奥术卷轴</h3>
  <p>承载内容的最小容器。</p>
</Card>`,
  props: [
    {
      name: 'variant',
      type: `'elevated' | 'outline'`,
      default: `'elevated'`,
      description: '视觉变体:elevated(surface 底 + 柔和阴影)/ outline(透明底 + 描边)。',
    },
    {
      name: 'interactive',
      type: 'boolean',
      default: 'false',
      description:
        '可交互:hover 上浮 + 奥术发光,并暴露键盘聚焦环(默认 tabIndex 0 + focus-visible)。',
    },
    {
      name: '...props',
      type: `ComponentPropsWithoutRef<'div'>`,
      default: '—',
      description: '透传原生 div 属性(className / style / onClick / children 等)。',
    },
  ],
  examples: [
    {
      title: '变体',
      node: (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Card variant="elevated" style={{ maxWidth: '16rem', padding: '1rem' }}>
            <strong>elevated</strong>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--ms-color-fg-muted)' }}>
              surface 底 + 柔和阴影。
            </p>
          </Card>
          <Card variant="outline" style={{ maxWidth: '16rem', padding: '1rem' }}>
            <strong>outline</strong>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--ms-color-fg-muted)' }}>
              透明底 + 描边。
            </p>
          </Card>
        </div>
      ),
    },
    {
      title: '可交互',
      description: '开启 interactive 后,hover 上浮发光,可聚焦可点击。',
      node: (
        <Card variant="elevated" interactive style={{ maxWidth: '16rem', padding: '1rem' }}>
          <strong>interactive</strong>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--ms-color-fg-muted)' }}>
            悬停或聚焦试试。
          </p>
        </Card>
      ),
    },
  ],
};
