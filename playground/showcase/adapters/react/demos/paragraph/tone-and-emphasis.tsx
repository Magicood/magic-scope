import { Paragraph } from '@magic-scope/react';

// 排版档总览:size 流式字阶、leading 行高语义、tone 上色、dimmed 弱化为辅助说明。
const BODY =
  '清晰的正文排版不靠华丽的字体,而靠稳定的阅读节奏。当字号、行高与间距彼此协调,最朴素的文字也能让人一眼读懂。';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem', maxInlineSize: 'min(560px, 100%)' }}>
      <Paragraph size="lg" leading="relaxed">
        大号舒展正文:{BODY}
      </Paragraph>

      <Paragraph tone="primary">主色段落:{BODY}</Paragraph>

      <Paragraph tone="info" size="sm">
        信息提示:{BODY}
      </Paragraph>

      <Paragraph dimmed size="sm" leading="snug">
        弱化辅助说明(dimmed,次要前景色):{BODY}
      </Paragraph>

      <Paragraph align="justify">两端对齐:{BODY}</Paragraph>
    </div>
  );
}
