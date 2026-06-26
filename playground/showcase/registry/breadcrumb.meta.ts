import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'breadcrumb',
  name: 'Breadcrumb',
  category: 'navigation',
  summary: '面包屑导航,语义化 nav/ol 结构,自动把末项识别为当前页。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n结构为 <nav aria-label="breadcrumb"> → <ol> → <li>:非当前项有 href 渲染 <a>(link 色 + hover 微光),无 href 渲染静态文本,当前项渲染 <span aria-current="page">(fg 色、不可点)。\n分隔符为装饰性元素(aria-hidden),屏幕阅读器忽略;末项未显式标 current 时按"末项即当前页"处理。label 可为任意节点(如带图标)。',
  controls: [
    { type: 'text', prop: 'separator', label: '分隔符 separator', default: '/' },
    { type: 'number', prop: 'depth', label: '层级数 depth', default: 4, min: 2, max: 5, step: 1 },
  ],
};
