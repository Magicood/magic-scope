import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'carousel',
  name: 'Carousel',
  category: 'data',
  summary:
    '内容轮播,children 即一屏:slide / fade 双效果、自动播放、拖拽切换,活动指示点随 tone 发光。',
  description:
    '自研、零依赖:每个 child 即一屏 slide,提供 slide(横/纵向位移)与 fade(叠放淡入淡出)两种切换效果,支持 loop 环绕、autoplay(可设间隔与悬停暂停)、可点指示点、prev/next 箭头与指针拖拽翻页。\n受控 activeIndex/onChange 与非受控 defaultIndex 双通道,并经 ref 暴露命令式 goTo。索引推进/环绕/夹取/拖拽判定抽成零 React 纯函数以便平移其它框架。\na11y 到位:root role=region + aria-roledescription=carousel,非活动 slide 隐藏且不可聚焦,箭头与指示点带 i18n aria-label。reduced-motion / data-ms-motion=off 下自动停播并关切换过渡。',
  controls: [
    {
      type: 'select',
      prop: 'effect',
      label: '切换效果 effect',
      default: 'slide',
      options: [
        { value: 'slide', label: 'slide 滑动' },
        { value: 'fade', label: 'fade 淡入淡出' },
      ],
    },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'primary',
      options: [
        { value: 'primary', label: 'primary' },
        { value: 'accent', label: 'accent' },
        { value: 'success', label: 'success' },
        { value: 'warning', label: 'warning' },
        { value: 'danger', label: 'danger' },
        { value: 'info', label: 'info' },
        { value: 'neutral', label: 'neutral' },
      ],
    },
    { type: 'boolean', prop: 'vertical', label: '纵向 vertical', default: false },
    { type: 'boolean', prop: 'loop', label: '环绕循环 loop', default: true },
    { type: 'boolean', prop: 'autoplay', label: '自动播放 autoplay', default: false },
    { type: 'boolean', prop: 'dots', label: '指示点 dots', default: true },
    { type: 'boolean', prop: 'arrows', label: '箭头 arrows', default: true },
    { type: 'boolean', prop: 'draggable', label: '拖拽切换 draggable', default: true },
  ],
  // 根为 <div role="region">,...rest 透传原生 div 属性。
  spread: 'div',
};
