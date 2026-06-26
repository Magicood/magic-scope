import { Select } from '@magic-scope/react';

const options = [
  { value: 'arcane', label: 'Arcane 奥术紫' },
  { value: 'frost', label: 'Frost 霜寒青' },
  { value: 'ember', label: 'Ember 余烬品红' },
];

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Select size="sm" options={options} value="frost" aria-label="尺寸 sm" />
      <Select size="md" options={options} value="frost" aria-label="尺寸 md" />
      <Select size="lg" options={options} value="frost" aria-label="尺寸 lg" />
    </div>
  );
}
