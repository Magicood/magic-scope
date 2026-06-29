import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'button',
  name: 'Button',
  category: 'actions',
  summary: '主操作按钮,五种视觉变体与三档尺寸,solid 带发光。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n完整覆盖 hover / active / focus-visible / disabled 状态与平滑过渡;solid 变体带可调发光(受顶栏「光影」开关控制)。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'solid',
      options: [
        { value: 'solid', label: 'solid 实底' },
        { value: 'soft', label: 'soft 柔色' },
        { value: 'outline', label: 'outline 描边' },
        { value: 'ghost', label: 'ghost 幽灵' },
        { value: 'link', label: 'link 链接' },
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
      ],
    },
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
      prop: 'shape',
      label: '形状 shape',
      default: 'default',
      options: [
        { value: 'default', label: 'default 圆角' },
        { value: 'pill', label: 'pill 胶囊' },
        { value: 'square', label: 'square 直角' },
      ],
    },
    {
      type: 'select',
      prop: 'glow',
      label: '发光 glow',
      default: 'auto',
      options: [
        { value: 'auto', label: 'auto 由变体决定' },
        { value: 'off', label: 'off 关闭' },
        { value: 'hover', label: 'hover 仅悬停' },
        { value: 'always', label: 'always 常亮' },
      ],
    },
    { type: 'boolean', prop: 'loading', label: '加载 loading', default: false },
    { type: 'boolean', prop: 'fullWidth', label: '铺满 fullWidth', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'text', prop: 'children', label: '文案', default: '保存更改' },
  ],
  spread: 'button',
};
