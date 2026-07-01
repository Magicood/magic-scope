import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'menubar',
  name: 'Menubar',
  category: 'navigation',
  summary:
    '应用菜单栏,横向一排顶级菜单触发器(文件 / 编辑 / 视图…),各自打开一个 Menu 面板,同一时刻至多一个打开。',
  description:
    '桌面级应用(编辑器 / 设计工具 / IDE)的顶部应用菜单栏:横向排布若干顶级菜单名,点击或键盘打开各自下拉,同一时刻至多一个展开,相邻顶级菜单间 ←→ 直接平移切换打开态。\n复合用法 Menubar + Menubar.Menu,items 数据驱动(label / icon / onClick / disabled / danger / separator / group / checked / shortcut / href + 一层 submenu)或 children 复合;复用 Menu 渲染契约与 Popover 浮层定位。\n完整 ARIA APG menubar 键盘模型:顶层 roving(←→ 回绕、Home/End)、↓/Enter/Space 打开落焦首项、菜单内 ↑↓ / Home/End / typeahead / Esc / Tab;受控(value = 打开菜单 id)与非受控双通道。',
  controls: [
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
    {
      type: 'select',
      prop: 'placement',
      label: '面板方位 placement',
      default: 'bottom-start',
      options: [
        { value: 'bottom-start', label: 'bottom-start 左下' },
        { value: 'bottom-end', label: 'bottom-end 右下' },
        { value: 'top-start', label: 'top-start 左上' },
        { value: 'top-end', label: 'top-end 右上' },
      ],
    },
    { type: 'boolean', prop: 'closeOnSelect', label: '选中即关 closeOnSelect', default: true },
    { type: 'boolean', prop: 'disabled', label: '整体禁用 disabled', default: false },
  ],
  alsoProps: ['Menubar.Menu'],
};
