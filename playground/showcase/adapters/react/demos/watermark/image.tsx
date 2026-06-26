import { Watermark } from '@magic-scope/react';

// 内联 SVG → data URL 作为水印图片(自包含、无外部依赖、无跨域问题)。
const LOGO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="32" viewBox="0 0 96 32">
       <text x="0" y="22" font-family="system-ui, sans-serif" font-size="20"
             font-weight="700" fill="rgb(124,92,255)">✦ scope</text>
     </svg>`,
  );

export default function Demo() {
  return (
    <Watermark
      image={LOGO}
      width={96}
      height={32}
      gap={[80, 100]}
      opacity={0.22}
      style={{
        inlineSize: 'min(440px, 100%)',
        borderRadius: 'var(--ms-radius-lg)',
        border: '1px solid var(--ms-color-border)',
        background: 'var(--ms-color-surface)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 'var(--ms-space-5)', display: 'grid', gap: 'var(--ms-space-2)' }}>
        <h3 style={{ margin: 0, color: 'var(--ms-color-fg)' }}>图片水印</h3>
        <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', lineHeight: 1.7 }}>
          传 image(url 或 data URL)即用图片做水印,按 width / height 绘制。image 优先于 content。
          图片自动按 devicePixelRatio 放大,Retina 屏依旧锐利。
        </p>
      </div>
    </Watermark>
  );
}
