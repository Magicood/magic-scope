import { Grid } from '@magic-scope/react';

// minChildWidth:每列至少 12rem、放不下自动折行(auto-fit + minmax),
// 无需写媒体查询即得「随容器宽度自动增减列数」的自适应卡片墙。
function Cell({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        padding: '0.75rem 0.875rem',
        borderRadius: 'var(--ms-radius-md, 0.5rem)',
        background: 'var(--ms-color-surface-raised, rgba(127, 127, 127, 0.12))',
        border: '1px solid var(--ms-color-border, rgba(127, 127, 127, 0.24))',
      }}
    >
      <strong style={{ fontSize: '0.9rem' }}>{title}</strong>
      <p style={{ margin: '0.35rem 0 0', color: 'var(--ms-color-fg-muted)', fontSize: '0.8rem' }}>
        {body}
      </p>
    </div>
  );
}

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(44rem, 100%)' }}>
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        <code>minChildWidth="12rem"</code> —— 列宽由内容驱动,容器变窄时自动减列、折行。
      </p>
      <Grid minChildWidth="12rem" gap={3}>
        <Cell title="塑能" body="爆发型瞬时伤害,稳定命中。" />
        <Cell title="咒法" body="召唤造物与远距传送。" />
        <Cell title="惑控" body="心智操纵与隐匿。" />
        <Cell title="防护" body="护盾与减伤,守住前排。" />
        <Cell title="预言" body="揭示先机,规避陷阱。" />
      </Grid>
    </div>
  );
}
