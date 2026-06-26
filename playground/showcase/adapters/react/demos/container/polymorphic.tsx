import { Container } from '@magic-scope/react';
import type { CSSProperties } from 'react';

const frame: CSSProperties = {
  border: '1px dashed var(--ms-color-border, #888)',
  borderRadius: 'var(--ms-radius-md, 8px)',
  background: 'var(--ms-color-bg-subtle, rgba(127,127,127,0.06))',
};

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: '100%' }}>
      {/* as:多态渲染成语义标签 section,样式行为不变。 */}
      <Container as="section" size="md" padding={4} style={frame}>
        <h3 style={{ margin: '0 0 0.25rem' }}>as="section"</h3>
        <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
          多态渲染成语义标签(section / main / article),限宽居中行为不变。
        </p>
      </Container>

      {/* asChild:把样式与 props 合并到唯一子元素(Slot 模式)。 */}
      <Container asChild size="md" padding={4}>
        <article style={frame}>
          <h3 style={{ margin: '0 0 0.25rem' }}>asChild</h3>
          <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
            渲染为唯一子元素 &lt;article&gt;,容器的 class / style 合并到它身上,不额外包一层。
          </p>
        </article>
      </Container>
    </div>
  );
}
