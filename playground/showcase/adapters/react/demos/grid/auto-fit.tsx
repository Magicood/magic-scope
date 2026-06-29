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
        <Cell title="概览" body="项目进度、成员与关键指标一览。" />
        <Cell title="活动" body="最近的提交、评论与状态变更。" />
        <Cell title="成员" body="团队席位、角色与权限管理。" />
        <Cell title="集成" body="连接代码仓库、CI 与第三方服务。" />
        <Cell title="计费" body="订阅方案、用量与发票记录。" />
      </Grid>
    </div>
  );
}
