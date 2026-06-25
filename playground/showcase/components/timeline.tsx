import { useState } from 'react';
import type { TimelineVariant } from '../../../packages/react/src/index';
import { Button, Timeline, TimelineItem } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

/** 演示用的事件流:每一条对应一个施法阶段。 */
const STEPS: {
  variant: TimelineVariant;
  title: string;
  time: string;
  icon: string;
  body: string;
}[] = [
  {
    variant: 'success',
    title: '咏唱完成',
    time: '00:00',
    icon: '✓',
    body: '法阵已点亮,奥术能量注入完毕。',
  },
  {
    variant: 'primary',
    title: '凝聚法球',
    time: '00:03',
    icon: '✦',
    body: '元素汇聚成型,等待引导。',
  },
  {
    variant: 'warning',
    title: '能量过载',
    time: '00:07',
    icon: '!',
    body: '法球亮度异常,建议立即释放。',
  },
  {
    variant: 'danger',
    title: '失控警告',
    time: '00:09',
    icon: '✕',
    body: '若不释放,反噬概率上升。',
  },
  {
    variant: 'info',
    title: '余波监测',
    time: '00:12',
    icon: 'i',
    body: '记录本次施法的残留读数。',
  },
];

function Demo({ values }: { values: ControlValues }) {
  const [active, setActive] = useState(2);
  const variant = values.variant as TimelineVariant;
  const showIcon = values.showIcon as boolean;
  const showTime = values.showTime as boolean;
  const headTitle = values.title as string;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <Timeline>
        <TimelineItem
          variant={variant}
          title={headTitle}
          time={showTime ? '刚刚' : undefined}
          icon={showIcon ? '✦' : undefined}
        >
          受旋钮控制的首条节点,实时反映 variant / icon / time / title。
        </TimelineItem>
        {STEPS.map((step, i) => (
          <TimelineItem
            key={step.title}
            variant={i <= active ? step.variant : 'default'}
            title={step.title}
            time={showTime ? step.time : undefined}
            icon={showIcon ? step.icon : undefined}
          >
            {step.body}
          </TimelineItem>
        ))}
      </Timeline>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          variant="outline"
          size="sm"
          disabled={active <= 0}
          onClick={() => setActive((n) => Math.max(0, n - 1))}
        >
          回退一步
        </Button>
        <Button
          size="sm"
          disabled={active >= STEPS.length - 1}
          onClick={() => setActive((n) => Math.min(STEPS.length - 1, n + 1))}
        >
          推进一步
        </Button>
      </div>
    </div>
  );
}

export const entry: DocEntry = {
  id: 'timeline',
  name: 'Timeline',
  category: 'data',
  summary: '时间线 / 信息流,语义化 <ol>,竖向轴 + 节点圆点 + 连线,节点可换图标按变体着色。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nTimeline 渲染语义化 <ol>,内含若干 TimelineItem;每条 = 节点(圆点或自定义图标)+ 连线(非末项)+ 内容(标题 / 时间 / 正文)。节点按 variant 语义着色,适合历史记录、进度推进与动态流。',
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
    { type: 'boolean', prop: 'showIcon', label: '显示图标 icon', default: true },
    { type: 'boolean', prop: 'showTime', label: '显示时间 time', default: true },
    { type: 'text', prop: 'title', label: '首条标题 title', default: '法术初始化' },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Timeline, TimelineItem } from '@magic-scope/react';

<Timeline>
  <TimelineItem variant="success" title="咏唱完成" time="00:00" icon="✓">
    法阵已点亮。
  </TimelineItem>
  <TimelineItem variant="primary" title="凝聚法球" time="00:03">
    元素汇聚成型。
  </TimelineItem>
</Timeline>`,
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description: 'Timeline:若干 TimelineItem 子节点。',
    },
    {
      name: '...props',
      type: `ComponentPropsWithoutRef<'ol'>`,
      default: '—',
      description: 'Timeline:透传原生 ol 属性(className / style 等)。',
    },
    {
      name: 'variant',
      type: `'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'`,
      default: `'default'`,
      description: 'TimelineItem:节点圆点的语义色。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      default: '—',
      description: 'TimelineItem:自定义节点内容(图标等),替代默认圆点。',
    },
    {
      name: 'time',
      type: 'ReactNode',
      default: '—',
      description: 'TimelineItem:次级元信息(时间 / 日期),渲染为 <time>。',
    },
    {
      name: 'title',
      type: 'ReactNode',
      default: '—',
      description: 'TimelineItem:条目标题。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description: 'TimelineItem:条目正文内容。',
    },
    {
      name: '...props',
      type: `Omit<ComponentPropsWithoutRef<'li'>, 'title'>`,
      default: '—',
      description: 'TimelineItem:透传原生 li 属性(className / style 等)。',
    },
  ],
  examples: [
    {
      title: '语义变体',
      description: '六种 variant 对应不同节点配色。',
      node: (
        <Timeline>
          <TimelineItem variant="primary" title="primary" time="奥术" icon="✦">
            主要节点,奥术紫高亮。
          </TimelineItem>
          <TimelineItem variant="success" title="success" time="成功" icon="✓">
            操作成功完成。
          </TimelineItem>
          <TimelineItem variant="warning" title="warning" time="警示" icon="!">
            需要留意的状态。
          </TimelineItem>
          <TimelineItem variant="danger" title="danger" time="危险" icon="✕">
            出现错误或失败。
          </TimelineItem>
          <TimelineItem variant="info" title="info" time="信息" icon="i">
            一般性提示信息。
          </TimelineItem>
        </Timeline>
      ),
    },
    {
      title: '纯文本流',
      description: '不带图标与时间,仅标题 + 正文的极简信息流。',
      node: (
        <Timeline>
          <TimelineItem title="提交需求">收到来源截图与需求原文。</TimelineItem>
          <TimelineItem title="生成组件">pnpm new 生成目录与 component.json。</TimelineItem>
          <TimelineItem title="完成收录">建索引,可搜索、可追溯。</TimelineItem>
        </Timeline>
      ),
    },
  ],
};
