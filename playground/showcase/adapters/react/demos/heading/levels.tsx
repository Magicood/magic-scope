import { Heading } from '@magic-scope/react';

// level 定语义标签(渲染 h1–h6),不传 variant 时由 level 推导合理视觉。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <Heading level={1}>h1 巨标题 Display</Heading>
      <Heading level={2}>h2 标准标题 Title</Heading>
      <Heading level={3}>h3 区块标题 Title</Heading>
      <Heading level={4}>h4 副标题 Subtitle</Heading>
      <Heading level={5}>h5 次级副标题 Subtitle</Heading>
      <Heading level={6}>h6 说明小字 Caption</Heading>
    </div>
  );
}
