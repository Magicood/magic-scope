import { CopyButton } from '@magic-scope/react';

// 复用 Button 视觉语言:五种 variant × tone,配 withTooltip / tooltipPlacement。
export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <CopyButton value="solid" variant="solid" tone="primary">
        solid
      </CopyButton>
      <CopyButton value="soft" variant="soft" tone="accent">
        soft
      </CopyButton>
      <CopyButton
        value="outline"
        variant="outline"
        tone="success"
        withTooltip
        tooltipPlacement="bottom"
      >
        outline
      </CopyButton>
      <CopyButton value="ghost" variant="ghost" tone="info">
        ghost
      </CopyButton>
      <CopyButton value="link" variant="link" tone="primary">
        link
      </CopyButton>
    </div>
  );
}
