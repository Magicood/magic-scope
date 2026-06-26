import { Timeline, TimelineItem } from '@magic-scope/react';
import { useState } from 'react';

// 交互式时间线:每条 interactive 可聚焦、hover / active 高亮,点击或键盘 Enter·Space 触发 onSelect。
// 当前选中条 pulse 呼吸辉光强调「进行中」。active 受控,选中态由组件外的 state 驱动。
const STAGES: { title: string; time: string; body: string }[] = [
  { title: '排队等待', time: '已入队', body: '任务进入收录队列。' },
  { title: '抓取来源', time: '截图 / 需求', body: '采集来源截图与需求原文。' },
  { title: '生成组件', time: 'pnpm new', body: '生成目录与 component.json 模板。' },
  { title: '建立索引', time: 'registry', body: '写入索引,组件可搜索、可追溯。' },
];

export default function Demo() {
  const [selected, setSelected] = useState(1);

  return (
    <Timeline style={{ inlineSize: 'min(420px, 100%)' }}>
      {STAGES.map((stage, i) => {
        const isCurrent = i === selected;
        return (
          <TimelineItem
            key={stage.title}
            interactive
            active={isCurrent}
            pulse={isCurrent}
            onSelect={() => setSelected(i)}
            variant={i < selected ? 'success' : isCurrent ? 'primary' : 'default'}
            title={stage.title}
            time={stage.time}
            icon={i < selected ? '✓' : isCurrent ? '✦' : undefined}
          >
            {stage.body}
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}
