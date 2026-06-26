import type { ProseSize } from '@magic-scope/react';
import { Prose } from '@magic-scope/react';

const SIZES: { size: ProseSize; label: string }[] = [
  { size: 'sm', label: 'sm 紧凑' },
  { size: 'md', label: 'md 默认' },
  { size: 'lg', label: 'lg 阅读放大' },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-6, 1.5rem)' }}>
      {SIZES.map(({ size, label }) => (
        <div key={size}>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--ms-color-fg-muted)',
              marginBlockEnd: 'var(--ms-space-2, 0.5rem)',
            }}
          >
            {label}
          </div>
          <Prose size={size} style={{ inlineSize: 'min(520px, 100%)' }}>
            <h3>整档缩放,层级恒定</h3>
            <p>
              <code>size</code> 只调正文基准字号,其余元素以 em 相对推导 —— 无论放大还是缩小,
              标题与正文的比例关系都保持不变。
            </p>
          </Prose>
        </div>
      ))}
    </div>
  );
}
