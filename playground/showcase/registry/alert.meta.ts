import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'alert',
  name: 'Alert',
  category: 'feedback',
  summary: '语义提示框,四种变体(信息 / 成功 / 警告 / 危险),起始边强调条 + 柔和底色。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nrole="alert" 会向辅助技术主动播报内容;按变体用 color-mix 渲染柔和底色与起始边强调条,适合表单校验、操作结果、风险警示等场景。正文 overflow-wrap: anywhere,超长内容换行收在边界内。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'info',
      options: [
        { value: 'info', label: 'info 信息' },
        { value: 'success', label: 'success 成功' },
        { value: 'warning', label: 'warning 警告' },
        { value: 'danger', label: 'danger 危险' },
      ],
    },
    { type: 'text', prop: 'title', label: '标题', default: '更改已保存' },
    {
      type: 'text',
      prop: 'children',
      label: '正文',
      default: '你的资料已更新,新设置将立即生效。',
    },
    { type: 'boolean', prop: 'icon', label: '显示图标 icon', default: true },
    { type: 'boolean', prop: 'dismissible', label: '可关闭 dismissible', default: false },
  ],
  spread: 'div',
};
