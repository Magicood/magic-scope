import { Timeline, TimelineItem } from '@magic-scope/react';

export default function Demo() {
  return (
    <Timeline style={{ inlineSize: 'min(420px, 100%)' }}>
      <TimelineItem variant="primary" title="primary 奥术" time="✦ 主要" icon="✦">
        主要节点,奥术紫高亮。
      </TimelineItem>
      <TimelineItem variant="success" title="success 成功" time="✓ 完成" icon="✓">
        操作成功完成。
      </TimelineItem>
      <TimelineItem variant="warning" title="warning 警示" time="! 留意" icon="!">
        需要留意的状态。
      </TimelineItem>
      <TimelineItem variant="danger" title="danger 危险" time="✕ 失败" icon="✕">
        出现错误或失败。
      </TimelineItem>
      <TimelineItem variant="info" title="info 信息" time="i 提示" icon="i">
        一般性提示信息。
      </TimelineItem>
      <TimelineItem variant="default" title="default 中性">
        默认圆点,无图标的中性节点。
      </TimelineItem>
    </Timeline>
  );
}
