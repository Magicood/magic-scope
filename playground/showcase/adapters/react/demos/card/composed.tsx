import { Button, Card } from '@magic-scope/react';

export default function Demo() {
  return (
    <Card variant="elevated" style={{ maxInlineSize: '20rem' }}>
      <h3 style={{ marginBlockStart: 0, marginBlockEnd: '0.25rem' }}>Atlas 平台</h3>
      <p style={{ margin: '0 0 1rem', color: 'var(--ms-color-fg-muted)' }}>
        团队协作的项目管理工作区,支持任务看板、成员协同与进度追踪。卡片可自由组合标题、正文与操作区。
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button size="sm">打开</Button>
        <Button size="sm" variant="ghost">
          详情
        </Button>
      </div>
    </Card>
  );
}
