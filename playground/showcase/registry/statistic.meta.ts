import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'statistic',
  name: 'Statistic',
  category: 'data',
  summary: '单指标数值展示,千分位 / 精度格式化 + 趋势染色 + 挂载滚动动画。',
  description:
    '自研、零依赖,做仪表盘 / 概览卡里的单指标展示。数值格式化(千分位插入 + precision 小数位 + 拆 sign/integer/fraction 三段分字号)抽成零 React 纯函数(logic.ts),便于平移 core 与单测;number 与数字串都会被解析,非数字串(如 "N/A")原样透传。\ntrend up/down 不写死颜色,统一走全库 tone resolver(up→success / down→danger)并配方向箭头;loading 渲染骨架占位(aria-busy)。animateOnMount 用 requestAnimationFrame 从 0 缓出滚到终值,但尊重 prefers-reduced-motion 与 data-ms-motion=off —— 命中时直接落终值不滚动。数值容器给完整 aria-label(标题+趋势+前缀+数值+后缀),size × 密度缩放,prefix/suffix/trend/title 留 classNames 槽位,as 多态根。',
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
    {
      type: 'select',
      prop: 'trend',
      label: '趋势 trend',
      default: 'up',
      options: [
        { value: 'none', label: '无(中性)' },
        { value: 'up', label: 'up(上升)' },
        { value: 'down', label: 'down(下降)' },
      ],
    },
    { type: 'number', prop: 'value', label: '数值 value', default: 12846.5, step: 100 },
    {
      type: 'number',
      prop: 'precision',
      label: '精度 precision',
      default: 1,
      min: 0,
      max: 6,
      step: 1,
    },
    { type: 'boolean', prop: 'loading', label: '加载态 loading', default: false },
    { type: 'boolean', prop: 'animateOnMount', label: '挂载滚动 animateOnMount', default: false },
  ],
};
