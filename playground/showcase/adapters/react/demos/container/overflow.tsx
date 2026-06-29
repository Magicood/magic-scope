import { Container } from '@magic-scope/react';
import type { CSSProperties } from 'react';

const frame: CSSProperties = {
  border: '1px dashed var(--ms-color-border, #888)',
  borderRadius: 'var(--ms-radius-md, 8px)',
  background: 'var(--ms-color-bg-subtle, rgba(127,127,127,0.06))',
};

const muted: CSSProperties = { margin: '0.5rem 0 0', color: 'var(--ms-color-fg-muted)' };

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: '100%' }}>
      {/* 对抗性:超长无空格串不撑破容器,在边界内换行。 */}
      <Container size="sm" padding={4} style={frame}>
        <strong>超长无空格串</strong>
        <p style={{ ...muted, overflowWrap: 'anywhere' }}>
          httpsmagicscopeexamplecomverylongunbreakableurlwithoutanyspacesatallthatwouldotherwiseoverflowtheboundary
        </p>
      </Container>

      {/* 对抗性:巨量正文照样收在限宽边界内,不顶破圆角。 */}
      <Container size="sm" padding={4} style={frame}>
        <strong>巨量正文</strong>
        <p style={muted}>
          标准套餐适合刚起步的小团队,按席位计费、随时可升级;专业套餐解锁单点登录与审计日志,适合需要合规的成长型公司;企业套餐提供专属支持与自定义额度,由销售按需报价。这段文本刻意写得很长,用来验证容器在内容溢出时仍把正文换行收在限宽边界内,既不会撑破容器、不会顶破圆角,也不会破坏外层布局。再写一段以加大文本量:存储、带宽、成员数三项配额各档不同,容器只负责把它们居中限宽,排版交给内部内容。
        </p>
      </Container>

      {/* 对抗性:可聚焦元素的 focus-visible 聚焦环不被容器内边距裁掉。 */}
      <Container size="sm" padding={4} style={frame}>
        <strong>聚焦环不被裁切</strong>
        <p style={muted}>Tab 聚焦下方按钮,聚焦环应完整可见(贴边时也不被容器内边距裁掉)。</p>
        <button type="button" style={{ marginBlockStart: '0.5rem' }}>
          可聚焦元素
        </button>
      </Container>
    </div>
  );
}
