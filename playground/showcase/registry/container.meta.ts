import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'container',
  name: 'Container',
  category: 'layout',
  summary: '居中定宽容器,限宽 + 水平居中 + 响应式内边距,把页面骨架一把收口。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nsize 提供 sm/md/lg/xl/full 五档(对齐视口断点)或任意自定义长度;fluid 一键满宽。始终 margin-inline:auto 水平居中,内边距用 CSS 逻辑属性(padding-inline / padding-block)RTL 友好,并叠加安全区避刘海裁切。padding / paddingBlock 支持 space token 档与断点对象做响应式;不传 padding 时走流式 clamp 随视口平滑收放。centered 整屏垂直居中。留口:as / asChild 多态、forwardRef 到根、...rest 透传原生属性。',
  controls: [
    {
      type: 'select',
      prop: 'size',
      label: '尺寸档 size',
      default: 'md',
      options: [
        { value: 'sm', label: 'sm 30rem' },
        { value: 'md', label: 'md 48rem' },
        { value: 'lg', label: 'lg 64rem' },
        { value: 'xl', label: 'xl 80rem' },
        { value: 'full', label: 'full 不限宽' },
      ],
    },
    { type: 'boolean', prop: 'fluid', label: '满宽 fluid', default: false },
    { type: 'boolean', prop: 'centered', label: '垂直居中 centered', default: false },
    {
      type: 'select',
      prop: 'padding',
      label: '水平内边距 padding',
      default: '',
      options: [
        { value: '', label: '默认(流式 clamp)' },
        { value: '2', label: 'token 2' },
        { value: '4', label: 'token 4' },
        { value: '8', label: 'token 8' },
      ],
    },
  ],
  spread: 'div',
};
