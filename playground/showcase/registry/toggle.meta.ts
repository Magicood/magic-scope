import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'toggle',
  name: 'Toggle',
  category: 'actions',
  summary:
    '双态切换按钮,用 aria-pressed 表达按下 / 未按下,典型用于工具栏里的图标按钮(加粗 / 斜体 / 静音)。',
  description:
    '区别于 Switch(开 / 关)与 Segmented(多选其一)的单按钮双态控件:按下 / 未按下两态,语义走 aria-pressed 而非 checkbox / radio。\n视觉沿用 Button 的 variant × tone × size × shape,与按钮族一致;未按下时静默(读 fg-muted),按下时点亮 tone 实底 / 柔底 / 描边并叠发光高亮。\n受控(pressed + onPressedChange)与非受控(defaultPressed)双通道,键盘 Enter / Space 由原生 button 接管,disabled 与 reduced-motion 降级齐备。',
  controls: [
    { type: 'boolean', prop: 'defaultPressed', label: '初始按下 defaultPressed', default: true },
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'soft',
      options: [
        { value: 'solid', label: 'solid 实底' },
        { value: 'soft', label: 'soft 柔底' },
        { value: 'outline', label: 'outline 描边' },
        { value: 'ghost', label: 'ghost 幽灵' },
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
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'md',
      options: [
        { value: 'sm', label: 'sm 小' },
        { value: 'md', label: 'md 中' },
        { value: 'lg', label: 'lg 大' },
      ],
    },
    {
      type: 'select',
      prop: 'shape',
      label: '形状 shape',
      default: 'default',
      options: [
        { value: 'default', label: 'default 圆角' },
        { value: 'square', label: 'square 方形' },
        { value: 'pill', label: 'pill 胶囊' },
      ],
    },
    { type: 'boolean', prop: 'iconOnly', label: '纯图标 iconOnly', default: false },
    { type: 'boolean', prop: 'glow', label: '按下发光 glow', default: true },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'text', prop: 'label', label: '按钮文案', default: '加粗 B' },
  ],
  spread: 'button',
};
