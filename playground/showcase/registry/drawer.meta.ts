import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'drawer',
  name: 'Drawer',
  category: 'overlay',
  summary: '侧边抽屉,基于原生 <dialog> + showModal(),支持四向滑入与焦点陷阱。',
  description:
    '原生 <dialog> 提供焦点陷阱、Esc 关闭、::backdrop 遮罩、top-layer(永远最上,无需 z-index)。自研封装受控 open、四个方向滑入(start/end/top/bottom)、点遮罩关闭、内建关闭按钮(有标题时在头部、无标题时浮动)、锁背景滚动、安全区避让,并尊重 reduced-motion(入场动画受顶栏动效开关控制)。',
  controls: [
    {
      type: 'select',
      prop: 'side',
      label: '滑入边 side',
      default: 'end',
      options: [
        { value: 'start', label: 'start 左' },
        { value: 'end', label: 'end 右' },
        { value: 'top', label: 'top 上' },
        { value: 'bottom', label: 'bottom 下' },
      ],
    },
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'md',
      options: [
        { value: 'sm', label: 'sm 紧凑' },
        { value: 'md', label: 'md 默认' },
        { value: 'lg', label: 'lg 宽阔' },
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
    { type: 'text', prop: 'title', label: '标题 title', default: '奥术抽屉' },
    { type: 'boolean', prop: 'dismissable', label: '点遮罩关闭 dismissable', default: true },
  ],
  spread: 'dialog',
};
