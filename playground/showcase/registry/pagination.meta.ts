import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'pagination',
  name: 'Pagination',
  category: 'navigation',
  summary: '分页导航,首尾恒显、当前页两侧对称展开,页数过多时省略号折叠。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n<nav aria-label="pagination"> 内含上一页 / 页码 / 下一页:当前页 primary 实底 + aria-current,其余 ghost;页数超出可展示槽位时用省略号占位折叠;首尾页禁用对应方向键。键盘可达,focus-visible 显示发光环。受控 page,翻页走 onPageChange。',
  controls: [
    { type: 'number', prop: 'total', label: '总页数 total', default: 12, min: 1, max: 50, step: 1 },
    {
      type: 'number',
      prop: 'siblingCount',
      label: '两侧页数 siblingCount',
      default: 1,
      min: 0,
      max: 3,
      step: 1,
    },
  ],
  spread: 'nav',
};
