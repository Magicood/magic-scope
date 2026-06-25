import { Skeleton } from '@magic-scope/react';

// 列表 / 段落占位:多行 text 不等宽,末行收短,贴近真实文字排版的加载态。
const rows = ['100%', '96%', '100%', '88%', '64%'];

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', inlineSize: '20rem' }}>
      {rows.map((w, i) => (
        <Skeleton
          // biome-ignore lint/suspicious/noArrayIndexKey: 静态占位,行无稳定 id
          key={i}
          variant="text"
          style={{ inlineSize: w }}
        />
      ))}
    </div>
  );
}
