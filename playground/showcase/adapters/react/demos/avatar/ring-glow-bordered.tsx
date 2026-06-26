import { Avatar } from '@magic-scope/react';
import type { ReactNode } from 'react';

// 强调特性:ring 发光描边环(标记当前用户 / 在线态)、glow 实例级发光强度、bordered 可见边框。
// glow 四档:auto 仅占位态柔光 / off 关 / hover 仅悬停 / always 常亮(受全局 fx 与 --ms-motion-scale 影响)。
const SRC = 'https://i.pravatar.cc/120?img=32';

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
      {children}
      <span style={{ fontSize: '0.75rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
    </div>
  );
}

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
        <Cell label="ring 光环">
          <Avatar ring tone="success" src={SRC} name="Vivian" />
        </Cell>
        <Cell label="ring + 状态点">
          <Avatar ring status="online" statusPulse src={SRC} name="Vivian" />
        </Cell>
        <Cell label="bordered 边框">
          <Avatar bordered src={SRC} name="Vivian" />
        </Cell>
        <Cell label="占位 + bordered">
          <Avatar bordered tone="accent" name="Galahad" />
        </Cell>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
        <Cell label="glow auto">
          <Avatar glow="auto" tone="primary" name="Elaine" />
        </Cell>
        <Cell label="glow always 常亮">
          <Avatar glow="always" tone="accent" name="Elaine" />
        </Cell>
        <Cell label="glow hover 悬停">
          <Avatar glow="hover" tone="info" name="Elaine" />
        </Cell>
        <Cell label="glow off 关闭">
          <Avatar glow="off" tone="warning" name="Elaine" />
        </Cell>
      </div>
    </div>
  );
}
