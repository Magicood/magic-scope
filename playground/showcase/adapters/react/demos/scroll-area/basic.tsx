import { ScrollArea } from '@magic-scope/react';

// 纵向长列表:固定高度容器,系统滚动条隐藏、自绘 thumb 悬停浮现。
const tags = Array.from({ length: 20 }, (_, i) => `标签 ${i + 1}`);

export default function Demo() {
  return (
    <ScrollArea
      style={{
        blockSize: '200px',
        inlineSize: 'min(300px, 100%)',
        border: '1px solid var(--ms-color-border)',
        borderRadius: 'var(--ms-radius-md)',
      }}
    >
      <ul style={{ margin: 0, padding: '0.5rem 0', listStyle: 'none' }}>
        {tags.map((t) => (
          <li key={t} style={{ padding: '0.5rem 0.9rem', color: 'var(--ms-color-fg-muted)' }}>
            {t}
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
