import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'dropdown',
  name: 'Dropdown',
  category: 'navigation',
  summary:
    '下拉菜单便捷封装,trigger 元素 + 数据驱动菜单项(或 children 复合),点击 / 悬停展开;复用 Popover 定位与 Menu 渲染契约。',
  description:
    '比裸 Menu 更省事的下拉入口:trigger 注入 aria-haspopup=menu / aria-expanded / aria-controls,items 数据驱动(label / icon / onClick / disabled / danger / separator / group / checked / href)或 children 复合二选一。\n支持 click 与 hover 两种触发、12 向 placement、选中即关(closeOnSelect)、Enter / ↓ 打开与菜单内 ↑↓ / Home / End / typeahead / Esc 全键盘、受控与非受控开合。\n子菜单先支持一层(hover 或 → 展开,← 收起);浮层定位与配色复用 Popover / Menu 语义,与全库一致。',
  controls: [
    {
      type: 'select',
      prop: 'triggerAction',
      label: '触发方式 triggerAction',
      default: 'click',
      options: [
        { value: 'click', label: 'click 点击' },
        { value: 'hover', label: 'hover 悬停' },
      ],
    },
    {
      type: 'select',
      prop: 'placement',
      label: '方位 placement',
      default: 'bottom-start',
      options: [
        { value: 'bottom-start', label: 'bottom-start 左下' },
        { value: 'bottom-end', label: 'bottom-end 右下' },
        { value: 'top-start', label: 'top-start 左上' },
        { value: 'right-start', label: 'right-start 右侧' },
      ],
    },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'primary',
      options: [
        { value: 'primary', label: 'primary 主色' },
        { value: 'accent', label: 'accent 强调' },
        { value: 'success', label: 'success 成功' },
        { value: 'warning', label: 'warning 警告' },
        { value: 'danger', label: 'danger 危险' },
        { value: 'info', label: 'info 信息' },
        { value: 'neutral', label: 'neutral 中性' },
      ],
    },
    { type: 'boolean', prop: 'arrow', label: '指向箭头 arrow', default: false },
    { type: 'boolean', prop: 'closeOnSelect', label: '选中即关 closeOnSelect', default: true },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
  ],
  spread: 'div',
};
