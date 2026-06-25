import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'kbd',
  name: 'Kbd',
  category: 'typography',
  summary: '键盘按键样式,展示快捷键如 ⌘K、Ctrl + C,带键帽立体感。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nsurface-raised 底 + 1px 描边 + 加粗底边模拟键帽立体感,radius-sm、font-mono、紧凑内边距。\n组合键用多个 <Kbd> 并以分隔符拼接即可;无交互状态但保留 transition 以备未来。',
  controls: [
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'md',
      options: [
        { value: 'sm', label: 'sm 紧凑' },
        { value: 'md', label: 'md 默认' },
      ],
    },
    { type: 'text', prop: 'children', label: '按键文案', default: '⌘ K' },
  ],
  spread: 'kbd',
};
