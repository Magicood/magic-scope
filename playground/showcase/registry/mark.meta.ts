import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'mark',
  name: 'Mark',
  category: 'typography',
  summary: '文本高亮:把命中搜索词的片段包进语义化 <mark>,着色走 tone 槽位。',
  description:
    '自研、零依赖,把「在纯文本里按搜索词找命中片段」拆成可独立单测、可跨框架复用的纯函数(logic.ts):多词各自全局匹配后做区间并集与重叠合并,绝不产生嵌套包裹;搜索词里的正则元字符按字面量转义处理,用户输入 . * ( ) 等也不报错。\n命中片段用原生 <mark> 元素保证无障碍语义(辅助技术识别为「高亮 / 相关」文本),覆盖 UA 默认黄底黑字、改走全库 tone 槽位(--ms-c / --ms-c-glow)随主题换肤联动。支持区分大小写、整词匹配;空搜索词与超长无空格串都安全降级、不撑破布局;多态 as 容器与 classNames(root / hit)细粒度槽位留口。',
  controls: [
    {
      type: 'text',
      prop: 'search',
      label: '搜索词 search',
      default: 'magic',
      placeholder: '输入要高亮的词',
    },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'warning',
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
    { type: 'boolean', prop: 'caseSensitive', label: '区分大小写 caseSensitive', default: false },
    { type: 'boolean', prop: 'wholeWord', label: '整词匹配 wholeWord', default: false },
  ],
  spread: 'span',
};
