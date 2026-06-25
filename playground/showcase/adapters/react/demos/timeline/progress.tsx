import { Button, Timeline, TimelineItem } from '@magic-scope/react';
import { useState } from 'react';

const STAGES = [
  { title: '排队等待', time: '已入队', body: '任务进入收录队列。' },
  { title: '抓取来源', time: '截图 / 需求', body: '采集来源截图与需求原文。' },
  { title: '生成组件', time: 'pnpm new', body: '生成目录与 component.json 模板。' },
  { title: '建立索引', time: 'registry', body: '写入索引,组件可搜索、可追溯。' },
];

export default function Demo() {
  // active 之前的为成功,active 为进行中(奥术高亮),之后为待办(中性)。
  const [active, setActive] = useState(1);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        inlineSize: 'min(420px, 100%)',
      }}
    >
      <Timeline>
        {STAGES.map((stage, i) => (
          <TimelineItem
            key={stage.title}
            variant={i < active ? 'success' : i === active ? 'primary' : 'default'}
            title={stage.title}
            time={stage.time}
            icon={i < active ? '✓' : i === active ? '✦' : undefined}
          >
            {stage.body}
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
          disabled={active >= STAGES.length - 1}
          onClick={() => setActive((n) => Math.min(STAGES.length - 1, n + 1))}
        >
          推进一步
        </Button>
      </div>
    </div>
  );
}
