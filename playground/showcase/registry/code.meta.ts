import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'code',
  name: 'Code',
  category: 'typography',
  summary: '代码原语,行内随文流式 / 块级 pre,四变体 × 七 tone,块级带复制与行号。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n行内默认 `<code>` 随正文流式;block 切到 `<pre><code>`,保留空白、横向滚动并支持 tabSize。\n变体 solid / soft / outline / ghost × tone 走全库 tone resolver(只读 6 槽位,零硬编码配色);size 走流式字阶随密度缩放;mono 等宽字体可关。\n块级专属:copyable(剪贴板 + 已复制反馈,文案走 i18n)、lineNumbers(CSS counter,不污染复制内容)。glow 辉光点缀受全局「光影」开关与 reduced-motion 调制。\n留口:...rest 透传原生属性与事件;className / style 合并(用户优先);asChild 把样式合并到行内子元素;classNames 定制内层 code 与复制按钮;onCopy 语义回调。',
  controls: [
    { type: 'boolean', prop: 'block', label: '块级 block', default: false },
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'soft',
      options: [
        { value: 'solid', label: 'solid 实底' },
        { value: 'soft', label: 'soft 柔色' },
        { value: 'outline', label: 'outline 描边' },
        { value: 'ghost', label: 'ghost 幽灵' },
      ],
    },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'neutral',
      options: [
        { value: 'primary', label: 'primary' },
        { value: 'accent', label: 'accent' },
        { value: 'success', label: 'success' },
        { value: 'warning', label: 'warning' },
        { value: 'danger', label: 'danger' },
        { value: 'info', label: 'info' },
        { value: 'neutral', label: 'neutral' },
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
    { type: 'boolean', prop: 'mono', label: '等宽 mono', default: true },
    { type: 'boolean', prop: 'glow', label: '辉光 glow', default: false },
    { type: 'text', prop: 'children', label: '内容', default: 'npm install' },
  ],
  spread: 'code',
};
