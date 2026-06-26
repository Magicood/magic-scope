import { Switch } from '@magic-scope/react';

// 全 7 色调矩阵:tone 经全库统一 tone resolver 派生 checked 染色与发光,
// 是 magic-scope 各组件共享的差异点。默认 primary。
const tones = [
  ['primary', '主色'],
  ['accent', '强调'],
  ['success', '成功'],
  ['warning', '警告'],
  ['danger', '危险'],
  ['info', '信息'],
  ['neutral', '中性'],
] as const;

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '0.75rem 1.5rem',
      }}
    >
      {tones.map(([tone, label]) => (
        <Switch key={tone} tone={tone} defaultChecked aria-label={`${label}色调开关`}>
          <span style={{ color: 'var(--ms-color-fg-muted)' }}>{label}</span>
        </Switch>
      ))}
    </div>
  );
}
