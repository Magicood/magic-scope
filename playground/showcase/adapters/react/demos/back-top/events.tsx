import { BackTop } from '@magic-scope/react';
import { useRef, useState } from 'react';

// BackTop 的专有行为:用户 onClick 经 composeEventHandlers 先于回顶逻辑执行,
// 且可 e.preventDefault() 阻断回顶。这里回显点击事件,并提供开关验证「阻断回顶」。
export default function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  const [block, setBlock] = useState(false);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(420px, 100%)' }}>
      <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
        <input type="checkbox" checked={block} onChange={(e) => setBlock(e.target.checked)} />
        点击时 preventDefault(阻断回顶,仅记录日志)
      </label>
      <div
        ref={ref}
        style={{
          position: 'relative',
          transform: 'translateZ(0)',
          blockSize: '180px',
          overflow: 'auto',
          padding: 'var(--ms-space-3, 0.75rem)',
          border: '1px solid var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-lg, 0.75rem)',
          background: 'var(--ms-color-surface)',
        }}
      >
        <p style={{ marginBlock: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
          滚到底后点击右下浮钮,观察下方事件日志与是否回顶。
        </p>
        <div style={{ blockSize: '700px' }} aria-hidden="true" />
        <BackTop
          target={() => ref.current ?? window}
          visibilityHeight={40}
          right={12}
          bottom={12}
          onClick={(e) => {
            push(`onClick(preventDefault=${block})`);
            if (block) {
              e.preventDefault();
            }
          }}
        />
      </div>
      {log.length > 0 && (
        <ul
          style={{
            margin: 0,
            paddingInlineStart: '1.1rem',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.82rem',
          }}
        >
          {log.map((e) => (
            <li key={e.id}>{e.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
