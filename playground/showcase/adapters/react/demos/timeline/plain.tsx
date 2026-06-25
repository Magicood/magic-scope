import { Timeline, TimelineItem } from '@magic-scope/react';

export default function Demo() {
  return (
    <Timeline style={{ inlineSize: 'min(420px, 100%)' }}>
      <TimelineItem title="提交需求">收到来源截图与需求原文。</TimelineItem>
      <TimelineItem title="生成组件">pnpm new 生成目录与 component.json。</TimelineItem>
      <TimelineItem title="实现并校验">写组件,跑 lint / test / registry。</TimelineItem>
      <TimelineItem title="完成收录">建索引,可搜索、可追溯。</TimelineItem>
    </Timeline>
  );
}
