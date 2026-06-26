import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'anchor',
  name: 'Anchor',
  category: 'navigation',
  summary: '滚动锚点导航(scroll-spy),跟随滚动高亮当前小节,墨条平滑指示。',
  description:
    '自研、零依赖的页内目录导航:监听滚动容器算出当前可视小节并高亮,墨条指示器用 CSS 变量驱动平移、接 tone 槽位染色发光。\n「算哪个高亮」抽成零 React 的纯函数 resolveActiveLink(便于单测、可平移多框架),DOM 读 offset 与滚动副作用走 requestAnimationFrame 节流留在壳层。点击锚点 preventDefault 改走平滑 scrollTo(尊重 prefers-reduced-motion / data-ms-motion=off),支持 targetOffset 顶部留白。容器可由 getContainer 指定(默认 window),支持嵌套缩进、受控/非受控双模式,a11y 用 nav landmark + active 链接 aria-current=location。',
  controls: [
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'md',
      options: [
        { value: 'sm', label: 'sm' },
        { value: 'md', label: 'md' },
        { value: 'lg', label: 'lg' },
      ],
    },
    { type: 'boolean', prop: 'showInk', label: '墨条指示 showInk', default: true },
    {
      type: 'number',
      prop: 'offsetTop',
      label: '判定偏移 offsetTop',
      default: 0,
      min: 0,
      max: 200,
      step: 8,
    },
    {
      type: 'number',
      prop: 'targetOffset',
      label: '滚动留白 targetOffset',
      default: 16,
      min: 0,
      max: 200,
      step: 8,
    },
    {
      type: 'number',
      prop: 'bounds',
      label: '命中容差 bounds',
      default: 5,
      min: 0,
      max: 80,
      step: 5,
    },
  ],
  spread: 'nav',
};
