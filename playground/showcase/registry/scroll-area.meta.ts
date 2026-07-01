import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'scroll-area',
  name: 'ScrollArea',
  category: 'layout',
  summary:
    '自定义滚动区,原生 overflow 滚动 + 自绘 track / thumb 叠在内容上不占布局,几何与原生 scrollTop / scrollHeight 实时同步。',
  description:
    '尺寸受限的滚动容器:原生 overflow:auto 承载滚动(保留键盘可达与惯性),隐藏系统滚动条后自绘一条与主题一致、叠在内容上不占布局的滚动条。\nthumb 尺寸 / 位置随真实 scrollTop / scrollHeight 同步、可拖拽反向滚动;type(auto / always / hover / scroll)控制显隐策略,orientation 支持纵 / 横 / 双向。\n几何换算抽成零依赖纯函数便于平移;尊重 reduced-motion 与 data-ms-motion=off。',
  controls: [
    {
      type: 'select',
      prop: 'type',
      label: '显隐策略 type',
      default: 'hover',
      options: [
        { value: 'auto', label: 'auto 有溢出即显' },
        { value: 'always', label: 'always 常显' },
        { value: 'hover', label: 'hover 悬停显' },
        { value: 'scroll', label: 'scroll 滚动时显' },
      ],
    },
    {
      type: 'select',
      prop: 'orientation',
      label: '方向 orientation',
      default: 'vertical',
      options: [
        { value: 'vertical', label: 'vertical 纵向' },
        { value: 'horizontal', label: 'horizontal 横向' },
        { value: 'both', label: 'both 双向' },
      ],
    },
    {
      type: 'number',
      prop: 'scrollHideDelay',
      label: '隐藏延时 scrollHideDelay(ms)',
      default: 600,
      min: 0,
      max: 2000,
      step: 100,
    },
  ],
  spread: 'div',
};
