import { FloatButton } from '@magic-scope/react';
import { useRef, useState } from 'react';

function Glyph({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}

// 受控 Group(open + onOpenChange)+ 子项 onClick 实时回显。
// hover 触发:指针进入整个 group 区域即展开,移出才收起。
export default function Demo() {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', inlineSize: 'min(420px, 100%)' }}>
      <div
        style={{
          position: 'relative',
          minBlockSize: '200px',
          border: '1px dashed var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-lg)',
          padding: 'var(--ms-space-3)',
        }}
      >
        <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>
          受控展开态:{open ? '展开' : '收起'}(悬停右下角触发)
        </span>
        <FloatButton.Group
          trigger="hover"
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            push(`onOpenChange(${next})`);
          }}
          direction="up"
          tone="accent"
          right={16}
          bottom={16}
          style={{ position: 'absolute' }}
        >
          <FloatButton
            tone="info"
            icon={<Glyph d="M21 15l-5-5L5 21" />}
            onClick={() => push('点击「图片」')}
            aria-label="图片"
          />
          <FloatButton
            tone="success"
            icon={<Glyph d="M12 19V5M5 12l7-7 7 7" />}
            onClick={() => push('点击「上传」')}
            aria-label="上传"
          />
        </FloatButton.Group>
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
