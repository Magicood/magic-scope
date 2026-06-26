import { Heading } from '@magic-scope/react';

// 视觉与语义解耦:统一 level={2}(语义同为 h2),仅切 variant 改变视觉档。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.85rem' }}>
      <Heading level={2} variant="display">
        display 巨标题
      </Heading>
      <Heading level={2} variant="title">
        title 标准标题
      </Heading>
      <Heading level={2} variant="subtitle">
        subtitle 副标题(弱化)
      </Heading>
      <Heading level={2} variant="overline">
        overline 上标签
      </Heading>
      <Heading level={2} variant="caption">
        caption 说明小字
      </Heading>
    </div>
  );
}
