import type { TimelineVariant } from '@magic-scope/react';
import { Timeline, TimelineItem } from '@magic-scope/react';

// variant 色调系统:全库统一差异点。每条节点经 tone resolver 派生强调色 / 柔底 / 光晕,
// 覆盖全部 8 个语义色调(default 中性不上色,其余 7 色经 ms-tone-* 着色)。
const TONES: {
  variant: TimelineVariant;
  title: string;
  time: string;
  icon: string;
  body: string;
}[] = [
  {
    variant: 'primary',
    title: 'primary 主要',
    time: '✦ 主要',
    icon: '✦',
    body: '主线节点,主色高亮。',
  },
  {
    variant: 'accent',
    title: 'accent 强调',
    time: '✧ 强调',
    icon: '✧',
    body: '次强调节点,辅助色高亮。',
  },
  { variant: 'success', title: 'success 成功', time: '✓ 完成', icon: '✓', body: '操作成功完成。' },
  {
    variant: 'warning',
    title: 'warning 警示',
    time: '! 留意',
    icon: '!',
    body: '需要留意的状态。',
  },
  { variant: 'danger', title: 'danger 危险', time: '✕ 失败', icon: '✕', body: '出现错误或失败。' },
  { variant: 'info', title: 'info 信息', time: 'i 提示', icon: 'i', body: '一般性提示信息。' },
  {
    variant: 'neutral',
    title: 'neutral 中和',
    time: '· 普通',
    icon: '·',
    body: '中和语义,弱化的普通节点。',
  },
  {
    variant: 'default',
    title: 'default 中性',
    time: '○ 默认',
    icon: '',
    body: '默认圆点,不上色的中性节点。',
  },
];

export default function Demo() {
  return (
    <Timeline style={{ inlineSize: 'min(420px, 100%)' }}>
      {TONES.map(({ variant, title, time, icon, body }) => (
        <TimelineItem
          key={variant}
          variant={variant}
          title={title}
          time={time}
          icon={icon || undefined}
        >
          {body}
        </TimelineItem>
      ))}
    </Timeline>
  );
}
