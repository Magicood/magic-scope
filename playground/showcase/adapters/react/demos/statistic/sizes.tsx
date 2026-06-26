import type { StatisticSize } from '@magic-scope/react';
import { Statistic } from '@magic-scope/react';

const SIZES: StatisticSize[] = ['sm', 'md', 'lg'];

export default function Demo() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--ms-space-6, 1.5rem)',
        alignItems: 'flex-start',
      }}
    >
      {SIZES.map((size) => (
        <Statistic
          key={size}
          title={`尺寸 ${size}`}
          value={48217.6}
          precision={1}
          prefix="¥"
          size={size}
        />
      ))}
    </div>
  );
}
