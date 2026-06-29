import type { SliderMark } from '@magic-scope/react';
import { Slider } from '@magic-scope/react';

// marks 沿轨道按值绝对定位,被填充覆盖的刻度高亮;showTooltip 拖动时显跟随气泡。
const marks: SliderMark[] = [
  { value: 0, label: '弱' },
  { value: 25, label: '低' },
  { value: 50, label: '中' },
  { value: 75, label: '高' },
  { value: 100, label: '满' },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '2rem', inlineSize: 'min(360px, 80vw)' }}>
      <Slider
        defaultValue={50}
        marks={marks}
        tone="accent"
        formatValue={(n) => `${n}%`}
        aria-label="带刻度的音量强度"
      />
      <Slider
        defaultValue={70}
        step={5}
        showTooltip
        tone="success"
        formatValue={(n) => `${n} 点`}
        aria-label="拖动显示跟随气泡"
      />
    </div>
  );
}
