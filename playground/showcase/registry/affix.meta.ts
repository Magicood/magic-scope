import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'affix',
  name: 'Affix',
  category: 'navigation',
  summary: '滚动吸附容器:滚到阈值时吸顶 / 吸底固定,等尺寸占位防跳动。',
  description:
    '自研、零依赖。把「该不该吸、吸成什么样」抽成框架无关的纯函数 computeAffix(给几何 + 偏移即出 affixed / mode / style),DOM 读 rect 的副作用、rAF 节流与状态留在薄壳,便于单测与平移 vue / core。\n监听 getTarget(默认 window)的滚动 / resize:超过 offsetTop 吸顶、超过 offsetBottom 吸底(两者都给以 offsetTop 优先),脱流时渲染等尺寸 placeholder 杜绝布局抖动,跨态经 onChange(affixed) 通知。宽度跟随用 ResizeObserver(特性检测,缺失降级);classNames 暴露 root / content 槽位,ref 经 useImperativeHandle 暴露 measure() 供布局变化后主动重测。吸附是布局而非动效,不受 motion=off 影响。',
  // 演示面板:mode + offset 为合成旋钮,在 adapter 里映射到真实的 offsetTop / offsetBottom。
  controls: [
    {
      type: 'select',
      prop: 'mode',
      label: '吸附模式 mode',
      default: 'top',
      options: [
        { value: 'top', label: 'top 吸顶(offsetTop)' },
        { value: 'bottom', label: 'bottom 吸底(offsetBottom)' },
      ],
    },
    {
      type: 'number',
      prop: 'offset',
      label: '偏移 offset(px)',
      default: 16,
      min: 0,
      max: 120,
      step: 4,
    },
  ],
  // 根层透传原生 div 属性(...rest),props 表展示「…props」继承行。
  spread: 'div',
};
