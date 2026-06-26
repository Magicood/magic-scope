import type { InputTone } from '@magic-scope/react';
import { Input } from '@magic-scope/react';

const tones: InputTone[] = ['primary', 'accent', 'success', 'warning', 'danger', 'info'];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(320px, 80vw)' }}>
      {tones.map((tone) => (
        <Input key={tone} tone={tone} placeholder={`聚焦看发光环 · ${tone}`} />
      ))}
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        聚焦任一输入框查看对应 tone 的发光环;invalid 时强制染 danger。
      </small>
    </div>
  );
}
