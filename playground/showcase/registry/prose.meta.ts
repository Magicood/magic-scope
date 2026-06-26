import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'prose',
  name: 'Prose',
  category: 'typography',
  summary: '富文本 / HTML 内容容器排版,一键给整块 markdown/CMS 内容套上全库排版规范。',
  description:
    '组件本体极轻:多态 as / asChild + className / classNames + children,真正的重头在 Prose.css —— 用后代选择器为 .ms-prose 内的 h1-h6 / p / ul / ol / li / blockquote / code / pre / a / hr / table / img 等统一排版,字号阶梯走 --ms-type-step-*、正文行距 --ms-leading-*、链接与列表标记走 tone 槽位,全部消费 --ms-* token 并随 data-ms-density 缩放。\nsize 三档只调正文基准字号,其余元素以 em 相对推导,缩放时层级关系恒定;不内置 dangerouslySetInnerHTML,是否信任 HTML 的安全决策交还调用方。内容边界稳健:超长 code/URL 不撑破(pre 横滚、行内长串断行、表格可横滚)。',
  controls: [
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'md',
      options: [
        { value: 'sm', label: 'sm 紧凑' },
        { value: 'md', label: 'md 默认' },
        { value: 'lg', label: 'lg 阅读放大' },
      ],
    },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'primary',
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
  ],
  spread: 'div',
};
