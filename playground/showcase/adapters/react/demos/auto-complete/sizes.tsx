import { AutoComplete } from '@magic-scope/react';

// 三档尺寸:sm / md / lg,随 data-ms-density 缩放。
const options = [{ value: 'Indigo 靛蓝' }, { value: 'Frost 霜蓝' }, { value: 'Ember 余烬橙' }];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', inlineSize: 'min(280px, 80vw)' }}>
      <AutoComplete size="sm" options={options} placeholder="尺寸 sm" aria-label="尺寸 sm" />
      <AutoComplete size="md" options={options} placeholder="尺寸 md" aria-label="尺寸 md" />
      <AutoComplete size="lg" options={options} placeholder="尺寸 lg" aria-label="尺寸 lg" />
    </div>
  );
}
