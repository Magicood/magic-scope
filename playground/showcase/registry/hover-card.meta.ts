import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'hover-card',
  name: 'HoverCard',
  category: 'overlay',
  summary:
    '悬停富预览卡,trigger(链接 / 头像)hover 或 focus 延时弹出可交互富内容卡,指针可从 trigger 移入卡内而不关闭。',
  description:
    '「鼠标悬停在链接 / 头像上预览富信息」的 overlay,区别于 Tooltip:可放图文、链接、按钮等可交互富内容,并允许指针从 trigger 平滑移入卡片内继续操作(桥接宽限做去向命中判定)。\n进入延时 openDelay(默认 700ms)再弹,移开延时 closeDelay(默认 300ms)再关。原生 Popover API(top-layer)+ CSS Anchor Positioning 锚定,12 向 placement + offset + 可选箭头 + tone 色调驱动边框 / 发光。\n复合 HoverCard / HoverCard.Trigger(asChild 注入)/ HoverCard.Content。受控(open + onOpenChange)/ 非受控(defaultOpen)双通道。a11y:补充信息层非 dialog——不抢焦不困焦,trigger aria-describedby 关联卡片,Esc 关闭;触屏诚实降级为 inert。',
  controls: [
    {
      type: 'select',
      prop: 'placement',
      label: '方位 placement',
      default: 'bottom',
      options: [
        { value: 'top', label: 'top 上方' },
        { value: 'bottom', label: 'bottom 下方' },
        { value: 'left', label: 'left 左侧' },
        { value: 'right', label: 'right 右侧' },
      ],
    },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'neutral',
      options: [
        { value: 'neutral', label: 'neutral 中性' },
        { value: 'primary', label: 'primary 主色' },
        { value: 'accent', label: 'accent 强调' },
        { value: 'success', label: 'success 成功' },
        { value: 'warning', label: 'warning 警告' },
        { value: 'danger', label: 'danger 危险' },
        { value: 'info', label: 'info 信息' },
      ],
    },
    { type: 'boolean', prop: 'arrow', label: '指向箭头 arrow', default: true },
    {
      type: 'number',
      prop: 'openDelay',
      label: '打开延时 openDelay(ms)',
      default: 300,
      min: 0,
      max: 1200,
      step: 100,
    },
    {
      type: 'number',
      prop: 'closeDelay',
      label: '关闭延时 closeDelay(ms)',
      default: 300,
      min: 0,
      max: 1200,
      step: 100,
    },
  ],
  alsoProps: ['HoverCard.Trigger', 'HoverCard.Content'],
};
