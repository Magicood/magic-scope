import type { BadgeTone, BadgeVariant } from '../../../packages/react/src/index';
import { Badge } from '../../../packages/react/src/index';
import type { DocEntry } from '../types';

const TONES: BadgeTone[] = ['primary', 'accent', 'success', 'warning', 'danger', 'neutral'];

export const entry: DocEntry = {
  id: 'badge',
  name: 'Badge',
  category: 'data',
  summary: '小标签,用于状态、计数或分类标记。',
  description:
    '小字号、圆角 full、紧凑内边距。solid 实底配 on-* 文字,soft 用 color-mix 柔和底,outline 走描边。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'soft',
      options: [
        { value: 'soft', label: 'soft 柔和' },
        { value: 'solid', label: 'solid 实底' },
        { value: 'outline', label: 'outline 描边' },
      ],
    },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'primary',
      options: TONES.map((t) => ({ value: t, label: t })),
    },
    { type: 'text', prop: 'children', label: '文案', default: 'Badge' },
  ],
  render: (v) => (
    <Badge variant={v.variant as BadgeVariant} tone={v.tone as BadgeTone}>
      {v.children as string}
    </Badge>
  ),
  usage: `import { Badge } from '@magic-scope/react';

<Badge tone="success" variant="solid">Active</Badge>`,
  props: [
    {
      name: 'variant',
      type: `'solid' | 'soft' | 'outline'`,
      default: `'soft'`,
      description: '视觉变体:实底 / 柔和底 / 描边。',
    },
    {
      name: 'tone',
      type: `'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral'`,
      default: `'primary'`,
      description: '语义色调。neutral 走中性的 fg-muted / border。',
    },
    {
      name: '...props',
      type: `ComponentPropsWithoutRef<'span'>`,
      default: '—',
      description: '透传原生 span 属性。',
    },
  ],
  examples: [
    {
      title: '全部色调(soft)',
      node: (
        <>
          {TONES.map((t) => (
            <Badge key={t} tone={t}>
              {t}
            </Badge>
          ))}
        </>
      ),
    },
    {
      title: '实底 solid',
      node: (
        <>
          {TONES.map((t) => (
            <Badge key={t} tone={t} variant="solid">
              {t}
            </Badge>
          ))}
        </>
      ),
    },
  ],
};
