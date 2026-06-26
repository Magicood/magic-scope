import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'mentions',
  name: 'Mentions',
  category: 'forms',
  summary: '@提及输入,敲触发前缀即弹候选浮层,键盘全可达、可异步搜索。',
  description:
    '自研、零依赖,基于原生 textarea:输入触发前缀(默认 @,可配多前缀如 @ / #)即弹出候选浮层,本地按 query 实时过滤或交给 onSearch 异步加载(配 loading / 空态)。\n选中候选后把光标前的触发段回填为「前缀 + 候选」并续接分隔符、光标落到其后;键盘 ↑↓ 移高亮(自动跳过禁用项)、Enter / Tab 选中、Esc 关闭。受控 / 非受控双通道,a11y 走 WAI-ARIA combobox + listbox/option 模型。三块纯算法(检测触发段 / 过滤 / 替换插入)抽到零 React 的 logic.ts,便于平移多框架与单测。',
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
      ],
    },
    { type: 'boolean', prop: 'invalid', label: '校验失败 invalid', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'boolean', prop: 'loading', label: '加载态 loading', default: false },
    { type: 'number', prop: 'rows', label: '行数 rows', default: 3, min: 2, max: 8, step: 1 },
  ],
  spread: 'textarea',
};
