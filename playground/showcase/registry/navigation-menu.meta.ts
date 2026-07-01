import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'navigation-menu',
  name: 'NavigationMenu',
  category: 'navigation',
  summary:
    '网站导航菜单,横向一排导航项,每项可是纯链接或带下拉 panel(mega-menu)的触发器;同一时刻至多一个 panel 打开,带平滑过渡。',
  description:
    '站点级导航(区别于命令菜单 Menubar / Menu):页头横向一排导航项,有的是纯跳转链接(可标 aria-current=page),有的点开是 mega-menu 放富内容或链接网格。\n同一时刻至多一个 panel 打开,切换平滑过渡;hover 用户从触发器移到 panel 途中不误关(open / close 延迟 + 穿越宽限的 hover-intent);键盘 ←→ 横向 roving、↓/Enter 打开并进入、Esc 关闭回触发器。\n语义区别于 menu:外层 nav 地标、触发器 button、链接是真链接。受控 / 非受控(value / onValueChange),共享 Viewport 单浮层容器随 active panel 过渡。',
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
      ],
    },
    {
      type: 'select',
      prop: 'viewportAlign',
      label: '浮层对齐 viewportAlign',
      default: 'start',
      options: [
        { value: 'start', label: 'start 靠左' },
        { value: 'center', label: 'center 居中' },
        { value: 'end', label: 'end 靠右' },
      ],
    },
    { type: 'boolean', prop: 'hoverable', label: '悬停打开 hoverable', default: true },
    { type: 'boolean', prop: 'viewport', label: '共享 Viewport viewport', default: true },
    {
      type: 'number',
      prop: 'openDelay',
      label: '打开延时 openDelay(ms)',
      default: 100,
      min: 0,
      max: 600,
      step: 50,
    },
  ],
  alsoProps: ['NavigationMenu.Trigger', 'NavigationMenu.Content', 'NavigationMenu.Link'],
};
