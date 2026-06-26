import { Watermark } from '@magic-scope/react';
import { useRef, useState } from 'react';

// Watermark 没有组件专有事件;这里改为「交互穿透」实证 —— 水印铺满覆盖在下层交互件之上,
// 点击 / 输入 / 选中仍正常触发,以此证明 pointer-events:none 真的不挡交互。
export default function Demo() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (t: string) => setLog((l) => [{ id: idRef.current++, text: t }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', inlineSize: 'min(440px, 100%)' }}>
      <Watermark
        content={['穿透实证', '点我下方控件']}
        fontSize={13}
        opacity={0.18}
        style={{
          borderRadius: 'var(--ms-radius-lg)',
          border: '1px solid var(--ms-color-border)',
          background: 'var(--ms-color-surface)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: 'var(--ms-space-5)', display: 'grid', gap: 'var(--ms-space-3)' }}>
          <button
            type="button"
            onClick={() => {
              setCount((c) => c + 1);
              push(`按钮点击 #${count + 1}(水印之上仍可点)`);
            }}
            style={{
              padding: 'var(--ms-space-2) var(--ms-space-4)',
              borderRadius: 'var(--ms-radius-md)',
              border: 'none',
              background: 'var(--ms-color-primary)',
              color: 'var(--ms-color-bg)',
              cursor: 'pointer',
              justifySelf: 'start',
            }}
          >
            已点击 {count} 次
          </button>
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              push(`输入框可聚焦输入:"${e.target.value}"`);
            }}
            placeholder="水印盖在我之上,我仍可输入"
            style={{
              padding: 'var(--ms-space-2) var(--ms-space-3)',
              borderRadius: 'var(--ms-radius-md)',
              border: '1px solid var(--ms-color-border)',
              background: 'var(--ms-color-bg)',
              color: 'var(--ms-color-fg)',
            }}
          />
          <p
            onMouseUp={() => {
              const sel = window.getSelection?.()?.toString() ?? '';
              if (sel) push(`选中文本:"${sel.slice(0, 24)}"`);
            }}
            style={{
              margin: 0,
              color: 'var(--ms-color-fg-muted)',
              lineHeight: 1.7,
              userSelect: 'text',
            }}
          >
            试着用鼠标划选这段文字 —— 水印是装饰层(aria-hidden + pointer-events:none),
            既不进可访问性树,也不拦截选择 / 点击 / 滚动。
          </p>
        </div>
      </Watermark>

      {log.length > 0 && (
        <ul
          style={{
            margin: 0,
            paddingInlineStart: '1.1rem',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.82rem',
            display: 'grid',
            gap: '0.2rem',
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
