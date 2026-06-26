import { Image } from '@magic-scope/react';

// placeholder:自定义加载中占位;fallback:自定义错误态内容(覆盖内建图标 + 文案)。
export default function Demo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ms-space-4)' }}>
      <div style={{ display: 'grid', gap: 'var(--ms-space-2)' }}>
        <Image
          src="https://picsum.photos/id/119/300/200"
          alt="自定义加载占位"
          width={220}
          height={150}
          rounded="md"
          placeholder={
            <div
              style={{
                display: 'grid',
                placeItems: 'center',
                inlineSize: '100%',
                blockSize: '100%',
                color: 'var(--ms-color-fg-muted)',
                fontSize: '0.85rem',
                background: 'var(--ms-color-surface)',
              }}
            >
              载入中…
            </div>
          }
        />
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>自定义 placeholder</small>
      </div>

      <div style={{ display: 'grid', gap: 'var(--ms-space-2)' }}>
        <Image
          src="https://example.invalid/nope.jpg"
          alt="自定义错误态"
          width={220}
          height={150}
          rounded="md"
          fallback={
            <div
              style={{
                display: 'grid',
                placeItems: 'center',
                gap: 'var(--ms-space-1)',
                color: 'var(--ms-color-danger, var(--ms-color-fg-muted))',
                fontSize: '0.85rem',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>⚠️</span>
              <span>封面暂不可用</span>
            </div>
          }
        />
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>自定义 fallback(错误态)</small>
      </div>
    </div>
  );
}
