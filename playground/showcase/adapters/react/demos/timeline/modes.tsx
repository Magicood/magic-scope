import type { TimelineMode } from '@magic-scope/react';
import { Timeline, TimelineItem } from '@magic-scope/react';

// 排布与连线签名:mode(left / right / alternate)切换左右轴,reverse 视觉倒序,
// lineStyle="dashed" 全线虚线,pending 末尾追加「进行中」节点(虚线引导 + 呼吸圆点)。
const EVENTS: {
  variant: 'primary' | 'success' | 'warning';
  title: string;
  time: string;
  icon: string;
}[] = [
  { variant: 'success', title: '咏唱完成', time: '00:00', icon: '✓' },
  { variant: 'primary', title: '凝聚法球', time: '00:03', icon: '✦' },
  { variant: 'warning', title: '能量过载', time: '00:07', icon: '!' },
];

const MODES: { mode: TimelineMode; label: string }[] = [
  { mode: 'left', label: 'left 轴在左(默认)' },
  { mode: 'right', label: 'right 轴在右' },
  { mode: 'alternate', label: 'alternate 左右交替' },
];

function Track({ mode, label }: { mode: TimelineMode; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.8125rem', opacity: 0.7 }}>{label}</span>
      <Timeline mode={mode} pending style={{ inlineSize: 'min(360px, 100%)' }}>
        {EVENTS.map((e) => (
          <TimelineItem
            key={e.title}
            variant={e.variant}
            title={e.title}
            time={e.time}
            icon={e.icon}
          >
            {`节点 ${e.time} 的进度描述。`}
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
      {MODES.map(({ mode, label }) => (
        <Track key={mode} mode={mode} label={label} />
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8125rem', opacity: 0.7 }}>reverse 倒序 + dashed 虚线</span>
        <Timeline reverse lineStyle="dashed" style={{ inlineSize: 'min(360px, 100%)' }}>
          {EVENTS.map((e) => (
            <TimelineItem
              key={e.title}
              variant={e.variant}
              title={e.title}
              time={e.time}
              icon={e.icon}
            >
              {`节点 ${e.time} 的进度描述。`}
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    </div>
  );
}
