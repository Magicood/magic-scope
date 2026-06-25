import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'button',
  name: 'Button',
  category: 'actions',
  summary: '主操作按钮,三种视觉变体与三档尺寸,solid 带奥术发光。',
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
        { value: 'outline', label: 'outline 描边' },
        { value: 'ghost', label: 'ghost 幽灵' },
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
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'text', prop: 'children', label: '文案', default: '施法 ✦' },
  ],
  spread: 'button',
};
