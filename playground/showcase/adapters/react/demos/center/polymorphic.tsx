import { Center } from '@magic-scope/react';

// 多态能力:
//  - as 换语义根标签(这里渲染为 section);
//  - inline 行内居中盒(inline-flex,宽度收缩、可与正文同行);
//  - asChild 让已有元素直接成为居中盒(不额外包一层 DOM,样式合并到子元素)。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.8rem' }}>
      <Center
        as="section"
        gap={2}
        padding={4}
        style={{
          border: '1px dashed var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-md)',
        }}
      >
        <span>as=&quot;section&quot; 语义根</span>
      </Center>

      <p style={{ margin: 0, lineHeight: 1.8 }}>
        正文里嵌一个
        <Center
          inline
          gap={1}
          padding="0 0.5rem"
          style={{
            border: '1px solid var(--ms-color-border)',
            borderRadius: 'var(--ms-radius-sm)',
            marginInline: '0.25rem',
          }}
        >
          <span>✦ 行内居中</span>
        </Center>
        的徽标,随文字流动。
      </p>

      <Center asChild padding={4}>
        <a
          href="#center"
          style={{
            border: '1px dashed var(--ms-color-border)',
            borderRadius: 'var(--ms-radius-md)',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          asChild:这个链接自己就是居中盒
        </a>
      </Center>
    </div>
  );
}
