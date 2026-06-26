import { Statistic } from '@magic-scope/react';

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
      <Statistic title="活跃用户" value={89234} />
      <Statistic title="本月营收" value={12846.5} precision={2} prefix="¥" />
      <Statistic title="转化率" value={68.4} precision={1} suffix="%" />
    </div>
  );
}
