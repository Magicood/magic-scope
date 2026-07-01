import { Heading } from '@magic-scope/react';

// 标题排版微调:字重 weight / 对齐 align / 字距 tracking / 大小写 transform / 折行 wrap。
// 与 level(语义)、variant(视觉档)解耦,可单独覆写。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.1rem', inlineSize: 'min(460px, 90vw)' }}>
      <Heading level={2} align="center" weight={800}>
        居中的加粗标题
      </Heading>
      <Heading level={4} transform="uppercase" tracking="widest" tone="accent">
        overline style label
      </Heading>
      <Heading level={3} wrap="balance" align="start">
        开启 balance 折行后,这个较长的多行标题每行长度会尽量均衡,不留孤字
      </Heading>
    </div>
  );
}
