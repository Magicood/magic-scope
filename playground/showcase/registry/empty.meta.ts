import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'empty',
  name: 'Empty',
  category: 'feedback',
  summary: '空状态占位,内置极简插画 + 描述 + 操作区,7 档语义色驱动着色与辉光。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n无数据 / 无结果 / 无搜索命中时的占位与引导:image 支持内置预设(default / simple)、自定义 ReactNode 或 false 关闭;description 默认走 i18n empty.description,可覆盖或关闭;children 作底部操作区(如重试按钮)。tone 7 档语义色驱动插画着色与克制辉光(受顶栏「光影」开关控制),size 随 data-ms-density 缩放;支持多态 as / asChild 与部件级 classNames。',
  controls: [
    {
      type: 'select',
      prop: 'image',
      label: '插画 image',
      default: 'default',
      options: [
        { value: 'default', label: 'default 文档卡片' },
        { value: 'simple', label: 'simple 极简托盘' },
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
    { type: 'text', prop: 'description', label: '描述文案', default: '这里空空如也' },
  ],
  spread: 'div',
};
