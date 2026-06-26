import type { DatePickerTone } from '@magic-scope/react';
import { DatePicker } from '@magic-scope/react';

const TONES: DatePickerTone[] = ['primary', 'accent', 'success', 'warning', 'danger', 'info'];

export default function Demo() {
  return (
    <div
      style={{ display: 'flex', gap: 'var(--ms-space-3)', flexWrap: 'wrap', alignItems: 'center' }}
    >
      {/* 聚焦时发光环按 tone 上色;点开任一选择器后用 Tab 聚焦触发器即可看到 */}
      {TONES.map((tone) => (
        <DatePicker key={tone} tone={tone} placeholder={tone} aria-label={`色调 ${tone}`} />
      ))}
    </div>
  );
}
