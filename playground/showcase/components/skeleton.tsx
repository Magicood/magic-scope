import type { SkeletonVariant } from '../../../packages/react/src/index';
import { Skeleton } from '../../../packages/react/src/index';
import type { DocEntry } from '../types';

export const entry: DocEntry = {
  id: 'skeleton',
  name: 'Skeleton',
  category: 'feedback',
  summary: '加载占位,三种形状(文本行 / 矩形 / 圆形),底色叠一道奥术流光。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nsurface-raised 底色叠加一道移动流光(linear-gradient + background-position),契合魔法主题。\n纯装饰:aria-hidden 且无语义角色。尊重 reduced-motion——降级为透明度呼吸而非完全静止。\n宽高由你用 style / className 决定,组件只负责形状与流光。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '形状 variant',
      default: 'rect',
      options: [
        { value: 'text', label: 'text 文本行' },
        { value: 'rect', label: 'rect 矩形' },
        { value: 'circle', label: 'circle 圆形' },
      ],
    },
  ],
  render: (v) => {
    const variant = v.variant as SkeletonVariant;
    const style =
      variant === 'circle'
        ? { width: '4rem', height: '4rem' }
        : variant === 'text'
          ? { width: '14rem' }
          : { width: '14rem', height: '5rem' };
    return <Skeleton variant={variant} style={style} />;
  },
  usage: `import { Skeleton } from '@magic-scope/react';

<Skeleton variant="circle" style={{ width: '3rem', height: '3rem' }} />
<Skeleton variant="text" style={{ width: '12rem' }} />`,
  props: [
    {
      name: 'variant',
      type: `'text' | 'rect' | 'circle'`,
      default: `'rect'`,
      description: '占位形状:text 为文本行(较矮 + 小圆角)/ rect 为矩形 / circle 为等宽高圆形。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      default: '—',
      description: '用于指定宽高;circle 取 width/height 较小者成圆。',
    },
    {
      name: '...props',
      type: `ComponentPropsWithoutRef<'div'>`,
      default: '—',
      description: '透传原生 div 属性(className / id / data-* 等);组件已内置 aria-hidden。',
    },
  ],
  examples: [
    {
      title: '形状',
      node: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Skeleton variant="circle" style={{ width: '3.5rem', height: '3.5rem' }} />
          <Skeleton variant="rect" style={{ width: '10rem', height: '4rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Skeleton variant="text" style={{ width: '12rem' }} />
            <Skeleton variant="text" style={{ width: '9rem' }} />
          </div>
        </div>
      ),
    },
    {
      title: '卡片占位',
      description: '圆形头像 + 多行文本组合,模拟内容加载中的卡片。',
      node: (
        <div
          style={{
            display: 'flex',
            gap: '0.875rem',
            alignItems: 'center',
            width: '18rem',
            padding: '1rem',
            borderRadius: 'var(--ms-radius-lg, 0.75rem)',
            background: 'var(--ms-color-surface-raised)',
          }}
        >
          <Skeleton variant="circle" style={{ width: '3rem', height: '3rem', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <Skeleton variant="text" style={{ width: '70%' }} />
            <Skeleton variant="text" style={{ width: '90%' }} />
            <Skeleton variant="text" style={{ width: '50%' }} />
          </div>
        </div>
      ),
    },
  ],
};
