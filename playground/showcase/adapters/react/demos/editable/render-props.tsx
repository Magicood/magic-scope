import { Editable } from '@magic-scope/react';
import { useState } from 'react';

// renderPreview / renderEdit 完全接管两态:展示态渲染成带图标的标题行,
// 编辑态自绘输入框 + 保存 / 取消按钮。ref 接到展示态元素以回收焦点。
export default function Demo() {
  const [title, setTitle] = useState('季度目标 OKR');

  return (
    <div style={{ inlineSize: 'min(400px, 100%)' }}>
      <Editable
        value={title}
        onChange={setTitle}
        inputAriaLabel="标题"
        renderPreview={({ text, edit, ref }) => (
          <button
            type="button"
            ref={ref as React.Ref<HTMLButtonElement>}
            onClick={edit}
            style={{
              display: 'inline-flex',
              gap: '0.4rem',
              alignItems: 'center',
              font: 'inherit',
              cursor: 'text',
              background: 'transparent',
              border: 'none',
              color: 'var(--ms-color-fg)',
              padding: 0,
            }}
          >
            <span aria-hidden="true">✎</span>
            <strong>{text}</strong>
          </button>
        )}
        renderEdit={({ value, setValue, submit, cancel }) => (
          <span style={{ display: 'inline-flex', gap: '0.4rem' }}>
            <input
              ref={(el) => el?.focus()}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
                if (e.key === 'Escape') cancel();
              }}
              style={{ font: 'inherit', padding: '0.2rem 0.4rem' }}
            />
            <button type="button" onClick={submit} style={{ font: 'inherit', cursor: 'pointer' }}>
              保存
            </button>
            <button type="button" onClick={cancel} style={{ font: 'inherit', cursor: 'pointer' }}>
              取消
            </button>
          </span>
        )}
      />
    </div>
  );
}
