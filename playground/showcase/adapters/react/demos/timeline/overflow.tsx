import { Timeline, TimelineItem } from '@magic-scope/react';

// 对抗性内容:超长无空格串 + 巨量正文,验证条目内容收在节点右侧、自然换行,不撑破竖向轴线。
export default function Demo() {
  return (
    <Timeline style={{ inlineSize: 'min(420px, 100%)' }}>
      <TimelineItem
        variant="primary"
        title="超长无空格串_arcane_runebind_incantation_segment_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        time="冗长时间戳_2026-06-25T17:00:00.000Z_arcane"
        icon="✦"
      >
        这是一段刻意拉得很长的正文,用来验证条目内容在节点右侧自然换行而不会把竖向轴线撑破:
        supercalifragilisticexpialidocious_arcane_overflow_test_segment_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        中文同样会连续排布很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长。
      </TimelineItem>
      <TimelineItem
        variant="warning"
        title="https://magic-scope.example.com/very/long/path/that/should/wrap/inside/the/timeline/item/content/area/without/breaking/the/axis"
        time="00:07"
        icon="!"
      >
        含超长 URL 与连续字符:wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww
        仍被收在边界内。
      </TimelineItem>
    </Timeline>
  );
}
