import type { DatePickerSize } from '@magic-scope/react';
import { DatePicker } from '@magic-scope/react';

const SIZES: DatePickerSize[] = ['sm', 'md', 'lg'];

export default function Demo() {
  return (
    <div
      style={{ display: 'flex', gap: 'var(--ms-space-3)', flexWrap: 'wrap', alignItems: 'center' }}
    >
      {SIZES.map((size) => (
        <DatePicker
          key={size}
          size={size}
          placeholder={`尺寸 ${size}`}
          aria-label={`尺寸 ${size}`}
        />
      ))}
    </div>
  );
}
