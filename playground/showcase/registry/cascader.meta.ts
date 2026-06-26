import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'cascader',
  name: 'Cascader',
  category: 'forms',
  summary: '级联选择,多列同屏展开沿一条路径逐级收窄,键盘四向全可达。',
  description:
    '自研、零依赖,从省/市/区、商品多级分类这类层级数据里逐级选出一条路径。trigger 显示选中路径(`浙江 / 杭州 / 西湖`)或占位,复用 Popover 浮层承载多列级联菜单:hover / 点击非叶子即展开下一列(多列同屏而非逐级弹窗),点叶子提交 `value: string[]` 并关闭,沿途 optionPath 一并回传供业务取每级数据。\nchangeOnSelect 允许选中非叶子边选边走;value / open 双通道受控;键盘 ↑↓ 列内移动、→ 进下一列、← 回上一列、Enter 选中 / 展开、Esc 关闭,采用 WAI-ARIA menu / menuitem + aria-expanded 模型;tone × size(随 data-ms-density 缩放),留口 classNames / displayRender,尊重 prefers-reduced-motion。纯路径算法抽到 logic.ts 以便平移到其它框架内核。',
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
    { type: 'boolean', prop: 'changeOnSelect', label: '边选边走 changeOnSelect', default: false },
    { type: 'boolean', prop: 'fullWidth', label: '块级铺满 fullWidth', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'text', prop: 'placeholder', label: '占位文本 placeholder', default: '请选择地区…' },
  ],
  // trigger 是个 button,根透传原生属性
  spread: 'button',
};
