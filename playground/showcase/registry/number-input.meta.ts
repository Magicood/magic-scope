import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'number-input',
  name: 'NumberInput',
  category: 'forms',
  summary: '数字步进输入,− / ＋ 按钮配原生 spinbutton,支持 min/max/step 与三档尺寸。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n结构为「− 按钮 + input[type=number] + ＋ 按钮」的整体描边控件,内部以显示文本管理,避免受控数字框打不出小数点 / 中间态的老问题。\n步进与失焦时夹取到 [min,max];触控热区达标、hover / focus 发光、尊重 reduced-motion。受控值通过 onValueChange 上报(有效数字传 number,清空传 null);到达边界时对应步进按钮自动禁用。',
  controls: [
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
  ],
  spread: 'input',
};
