import { Label } from '@magic-scope/react';

// 尺寸 size × 色调 tone × 自定义必填标记 requiredMark × 禁用 disabled。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.9rem' }}>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'baseline' }}>
        <Label size="sm">小号 sm</Label>
        <Label size="md">中号 md</Label>
        <Label size="lg">大号 lg</Label>
      </div>
      <Label tone="danger" required>
        校验失败态(tone=danger)
      </Label>
      <Label tone="success" required requiredMark={<span aria-hidden="true">✓</span>}>
        自定义必填标记 requiredMark
      </Label>
      <Label disabled>禁用态 disabled</Label>
    </div>
  );
}
