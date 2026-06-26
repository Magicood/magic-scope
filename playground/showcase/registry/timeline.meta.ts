import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'timeline',
  name: 'Timeline',
  category: 'data',
  summary: '时间线 / 信息流,语义化 <ol>,竖向轴 + 节点圆点 + 连线,节点可换图标按变体着色。',
  description:
    'compose 了 Timeline(语义化 <ol>)+ TimelineItem(单条节点)两件。\n自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。每条 = 节点(圆点或自定义图标)+ 连线(非末项)+ 内容(标题 / 时间 / 正文);节点按 variant(default / primary / success / warning / danger / info)语义着色。\n适合历史记录、进度推进与动态流;长内容在节点右侧自然换行,不撑破轴线。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '首条变体 variant',
      default: 'primary',
      options: [
        { value: 'default', label: 'default 中性' },
        { value: 'primary', label: 'primary 奥术' },
        { value: 'success', label: 'success 成功' },
        { value: 'warning', label: 'warning 警示' },
        { value: 'danger', label: 'danger 危险' },
        { value: 'info', label: 'info 信息' },
      ],
    },
    {
      type: 'select',
      prop: 'mode',
      label: '轴排布 mode',
      default: 'left',
      options: [
        { value: 'left', label: 'left 轴在左' },
        { value: 'right', label: 'right 轴在右' },
        { value: 'alternate', label: 'alternate 交替' },
      ],
    },
    {
      type: 'select',
      prop: 'lineStyle',
      label: '连线样式 lineStyle',
      default: 'solid',
      options: [
        { value: 'solid', label: 'solid 实线' },
        { value: 'dashed', label: 'dashed 虚线' },
      ],
    },
    { type: 'boolean', prop: 'reverse', label: '视觉倒序 reverse', default: false },
    { type: 'boolean', prop: 'pending', label: '进行中末节点 pending', default: false },
    { type: 'boolean', prop: 'showIcon', label: '显示图标 icon', default: true },
    { type: 'boolean', prop: 'showTime', label: '显示时间 time', default: true },
    { type: 'text', prop: 'title', label: '首条标题 title', default: '法术初始化' },
  ],
  spread: 'ol',
  alsoProps: ['TimelineItem'],
};
