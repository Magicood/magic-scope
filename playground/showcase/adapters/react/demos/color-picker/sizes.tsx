import { ColorPicker } from '@magic-scope/react';

// 三种尺寸的触发色块,随 data-ms-density 缩放。
export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <ColorPicker size="sm" defaultValue="#06b6d4" aria-label="尺寸 sm" />
      <ColorPicker size="md" defaultValue="#7c3aed" aria-label="尺寸 md" />
      <ColorPicker size="lg" defaultValue="#ef4444" aria-label="尺寸 lg" />
    </div>
  );
}
