import { Watermark } from '@magic-scope/react';
import { useState } from 'react';

// 真实溯源场景:把「当前查看者 + 时间」动态嵌成水印。换人即换水印,泄露可追责到具体账号。
const VIEWERS = ['李雷', '韩梅梅', '王强'] as const;

export default function Demo() {
  const [viewer, setViewer] = useState<string>(VIEWERS[0]);
  const stamp = '2026-06-26';

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', inlineSize: 'min(460px, 100%)' }}>
      <div style={{ display: 'flex', gap: 'var(--ms-space-2)', alignItems: 'center' }}>
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: 'var(--ms-font-size-sm)' }}>
          当前查看者:
        </span>
        {VIEWERS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setViewer(v)}
            style={{
              padding: 'var(--ms-space-1) var(--ms-space-3)',
              borderRadius: 'var(--ms-radius-sm)',
              border: '1px solid var(--ms-color-border)',
              background: v === viewer ? 'var(--ms-color-primary)' : 'var(--ms-color-bg)',
              color: v === viewer ? 'var(--ms-color-bg)' : 'var(--ms-color-fg)',
              cursor: 'pointer',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      <Watermark
        content={[`${viewer} 查看`, stamp]}
        fontSize={13}
        opacity={0.16}
        gap={[130, 110]}
        style={{
          borderRadius: 'var(--ms-radius-lg)',
          border: '1px solid var(--ms-color-border)',
          background: 'var(--ms-color-surface)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: 'var(--ms-space-5)', display: 'grid', gap: 'var(--ms-space-2)' }}>
          <h3 style={{ margin: 0, color: 'var(--ms-color-fg)' }}>合同条款(内部资料)</h3>
          <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', lineHeight: 1.7 }}>
            切换上方查看者,水印随之实时重绘 —— 内容(content)是受控 prop,改它就改水印。
            一旦这页被截图外传,水印上的姓名与日期即可定位泄露源头。
          </p>
        </div>
      </Watermark>
    </div>
  );
}
