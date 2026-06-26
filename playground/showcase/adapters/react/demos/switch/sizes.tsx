import { Switch } from '@magic-scope/react';

// 三档尺寸:轨道与滑块随尺寸缩放,并在不同密度 data-ms-density 下进一步联动。
const sizes = [
  ['sm', '小'],
  ['md', '中(默认)'],
  ['lg', '大'],
] as const;

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {sizes.map(([size, label]) => (
        <Switch key={size} size={size} defaultChecked aria-label={`${label}尺寸开关`}>
          <span style={{ color: 'var(--ms-color-fg-muted)' }}>{label}</span>
        </Switch>
      ))}
    </div>
  );
}
