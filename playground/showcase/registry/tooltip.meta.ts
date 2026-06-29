import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'tooltip',
  name: 'Tooltip',
  category: 'overlay',
  summary:
    '提示气泡,Popover API 进 top-layer + CSS Anchor 定位,hover / focus 触发,触屏 tap-to-toggle。',
  description:
    '气泡进 top-layer 用 Popover API(popover="manual" 手动控制,无需 z-index),定位用 CSS Anchor Positioning 并以 @supports 降级为相对定位。\nhover / focus 延时显示(delay),leave / blur / Esc 隐藏;trigger 与气泡用 aria-describedby 关联,非原生可聚焦元素自动注入 tabindex,键盘可达。\n触屏(无 hover)环境自动切到 tap-to-toggle:点 trigger 切换显隐、点外部关闭,桌面行为零变化。content 接受任意 ReactNode,可放富文本。',
  controls: [
    {
      type: 'select',
      prop: 'placement',
      label: '方位 placement',
      default: 'top',
      options: [
        { value: 'top', label: 'top 上方' },
        { value: 'bottom', label: 'bottom 下方' },
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
    { type: 'boolean', prop: 'arrow', label: '指向箭头 arrow', default: false },
    {
      type: 'number',
      prop: 'delay',
      label: '延时 delay(ms)',
      default: 150,
      min: 0,
      max: 1000,
      step: 50,
    },
    { type: 'text', prop: 'content', label: '提示内容 content', default: '查看更多详情' },
  ],
};
