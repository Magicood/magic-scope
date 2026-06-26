import type { ProseTone } from '@magic-scope/react';
import { Prose } from '@magic-scope/react';

const TONES: ProseTone[] = ['primary', 'accent', 'success', 'warning', 'danger', 'info', 'neutral'];

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--ms-space-4, 1rem)',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      }}
    >
      {TONES.map((tone) => (
        <Prose
          key={tone}
          tone={tone}
          size="sm"
          style={{
            padding: 'var(--ms-space-4, 1rem)',
            border: '1px solid var(--ms-color-border, #e5e7eb)',
            borderRadius: 'var(--ms-radius-md, 0.5rem)',
          }}
        >
          <h4>tone: {tone}</h4>
          <p>
            点缀色复用全库 tone 槽位 —— <a href="#tone">链接</a>、列表标记与引用条都跟随切换。
          </p>
          <ul>
            <li>第一条要点</li>
            <li>第二条要点</li>
          </ul>
          <blockquote>引用条也跟着 {tone} 着色。</blockquote>
        </Prose>
      ))}
    </div>
  );
}
