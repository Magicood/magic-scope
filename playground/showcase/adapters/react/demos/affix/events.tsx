import { Affix } from '@magic-scope/react';
import { useRef, useState } from 'react';

// onChange(affixed):仅在「不吸→吸」「吸→不吸」跨态时各触发一次(不会每帧回调)。
// 这里把跨态实时回显到日志,并用一枚状态点指示当前是否吸附。
export default function Demo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [affixed, setAffixed] = useState(false);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(420px, 100%)' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ms-space-2, 0.5rem)',
          fontSize: '0.9rem',
        }}
      >
        <span
          style={{
            inlineSize: 10,
            blockSize: 10,
            borderRadius: '50%',
            background: affixed
              ? 'var(--ms-color-success, #2faa6a)'
              : 'var(--ms-color-fg-muted, #888)',
          }}
        />
        当前状态:{affixed ? '已吸附 affixed=true' : '未吸附 affixed=false'}
      </div>

      <div
        ref={stageRef}
        style={{
          height: 200,
          overflow: 'auto',
          border: '1px solid var(--ms-color-border, rgba(0,0,0,0.12))',
          borderRadius: 'var(--ms-radius-lg, 0.75rem)',
          background: 'var(--ms-color-bg-subtle, rgba(0,0,0,0.02))',
          padding: 'var(--ms-space-3, 0.75rem)',
        }}
      >
        <div style={{ height: 120, color: 'var(--ms-color-fg-muted, #888)' }}>
          滚动越过此处会触发 onChange。
        </div>
        <Affix
          getTarget={() => stageRef.current ?? window}
          offsetTop={0}
          onChange={(next) => {
            setAffixed(next);
            push(`onChange(${next})`);
          }}
        >
          <div
            style={{
              padding: 'var(--ms-space-2, 0.5rem) var(--ms-space-3, 0.75rem)',
              borderRadius: 'var(--ms-radius-md, 0.5rem)',
              background: 'var(--ms-color-bg-elevated, #fff)',
              border: '1px solid var(--ms-color-border, rgba(0,0,0,0.12))',
              boxShadow: 'var(--ms-shadow-2, 0 4px 12px rgba(0,0,0,0.12))',
              fontWeight: 600,
            }}
          >
            吸附态监听条
          </div>
        </Affix>
        <div style={{ height: 480, color: 'var(--ms-color-fg-muted, #888)' }}>正文……</div>
      </div>

      {log.length > 0 && (
        <ul
          style={{
            margin: 0,
            paddingInlineStart: '1.1rem',
            color: 'var(--ms-color-fg-muted, #888)',
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
