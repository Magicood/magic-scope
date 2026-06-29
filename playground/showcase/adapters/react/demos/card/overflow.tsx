import { Card } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem', maxInlineSize: '18rem' }}>
      <Card variant="elevated">
        <strong>超长无空格串</strong>
        <p style={{ margin: '0.5rem 0 0', color: 'var(--ms-color-fg-muted)' }}>
          httpsmagicscopeexamplecomverylongunbreakableurlwithoutanyspacesatallthatwouldotherwiseoverflow
        </p>
      </Card>
      <Card variant="outline">
        <strong>巨量正文</strong>
        <p style={{ margin: '0.5rem 0 0', color: 'var(--ms-color-fg-muted)' }}>
          基础套餐按席位计费,适合小型团队;团队套餐解锁更多协作席位与审计日志; 企业套餐则提供
          SSO、专属支持与合规导出。这段文本刻意写得很长,用来验证卡片在内容溢出时
          仍然把正文换行收在边界内,不会撑破容器、不会顶破圆角,也不会破坏其它卡片的布局。
        </p>
      </Card>
    </div>
  );
}
