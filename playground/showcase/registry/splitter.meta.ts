import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'splitter',
  name: 'Splitter',
  category: 'layout',
  summary: '可拖拽分栏布局,拖中缝实时调占比,夹 min/max 且总和守恒,键盘可达、可折叠。',
  description:
    '自研、零依赖的可拖拽分栏原语,消费 @magic-scope/tokens 的 --ms-* 变量。复合 Splitter + Splitter.Panel:容器负责测量主轴(ResizeObserver 跟随)并以 inline flex-basis 统一注入各面板像素尺寸,面板只承载 min/max/defaultSize/collapsible 元数据。\n面板间自动渲染可拖拽 gutter——pointer 拖拽把 delta 分摊两侧、夹 min/max 且总和守恒(纯算法抽进 logic.ts 以便平移多框架);支持水平/垂直朝向,min/max 可像素或百分比混写。\n受控(sizes + onResize 回写)与非受控双通道并存;区分高频 onResize 与落定 onResizeEnd;gutter 带 role="separator" + aria-orientation + aria-valuenow 无障碍语义,方向键 ←→/↑↓ 步进、Home/End 推到极限、双击折叠相邻可折叠面板。\n命令式句柄 SplitterHandle 暴露 collapse / expand / getSizes;拖拽中关闭过渡跟手,折叠这类离散跳变才走过渡且尊重 prefers-reduced-motion 与 data-ms-motion="off"。',
  controls: [
    {
      type: 'select',
      prop: 'orientation',
      label: '朝向 orientation',
      default: 'horizontal',
      options: [
        { value: 'horizontal', label: 'horizontal 左右分栏' },
        { value: 'vertical', label: 'vertical 上下分栏' },
      ],
    },
    {
      type: 'number',
      prop: 'gutterSize',
      label: '分隔条厚度 gutterSize(px)',
      default: 6,
      min: 2,
      max: 24,
      step: 1,
    },
    {
      type: 'number',
      prop: 'keyboardStep',
      label: '键盘步进 keyboardStep(px)',
      default: 16,
      min: 4,
      max: 64,
      step: 4,
    },
  ],
  spread: 'div',
  alsoProps: ['Splitter.Panel'],
};
