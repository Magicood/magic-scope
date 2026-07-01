import { Toggle, type ToggleTone } from '@magic-scope/react';

// 全 7 色调:按下态经全库统一 tone resolver 派生染色与发光。
const tones: [ToggleTone, string][] = [
  ['primary', '主色'],
  ['accent', '强调'],
  ['success', '成功'],
  ['warning', '警告'],
  ['danger', '危险'],
  ['info', '信息'],
  ['neutral', '中性'],
];

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
        gap: '0.75rem',
      }}
    >
      {tones.map(([tone, label]) => (
        <Toggle key={tone} tone={tone} defaultPressed aria-label={`${label}色调`}>
          {label}
        </Toggle>
      ))}
    </div>
  );
}
