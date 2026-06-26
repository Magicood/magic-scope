import { Center } from '@magic-scope/react';

// 撑起最小高度 + 间距 + 内边距:整屏垂直居中的典型用法。
// minBlockSize 走逻辑属性 min-block-size;gap / padding 取间距档(映射 --ms-space-*)。
export default function Demo() {
  return (
    <Center
      gap={2}
      padding={6}
      minBlockSize={220}
      style={{
        inlineSize: 'min(380px, 100%)',
        border: '1px dashed var(--ms-color-border)',
        borderRadius: 'var(--ms-radius-md)',
      }}
    >
      <span style={{ fontSize: '1.4rem' }}>✦</span>
      <strong>欢迎回到结界</strong>
      <span style={{ color: 'var(--ms-color-fg-muted)' }}>子项纵向堆叠并整体居中</span>
    </Center>
  );
}
