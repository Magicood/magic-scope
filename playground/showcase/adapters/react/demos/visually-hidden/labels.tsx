import { VisuallyHidden } from '@magic-scope/react';

export default function Demo() {
  // 给表单控件补隐藏 label,给区块补朗读标题:视觉靠占位符 / 上下文足够,
  // 但 SR 用户需要明确的 label / 标题。as 换成语义标签(label / h2)。
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-5)', inlineSize: 'min(360px, 100%)' }}>
      {/* 隐藏 label:视觉用 placeholder,SR 读到真正的字段名 */}
      <div style={{ display: 'grid', gap: 'var(--ms-space-2)' }}>
        <VisuallyHidden as="label" htmlFor="vh-email">
          电子邮箱
        </VisuallyHidden>
        <input
          id="vh-email"
          type="email"
          placeholder="you@example.com"
          style={{
            padding: 'var(--ms-space-2) var(--ms-space-3)',
            borderRadius: 'var(--ms-radius-md)',
            border: '1px solid var(--ms-color-border)',
            background: 'var(--ms-color-bg)',
            color: 'var(--ms-color-fg)',
          }}
        />
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>
          视觉只见 placeholder;SR 读到 label「电子邮箱」。
        </small>
      </div>

      {/* 隐藏区块标题:视觉布局已自解释,SR 用户靠标题导航 */}
      <section
        style={{
          display: 'grid',
          gap: 'var(--ms-space-2)',
          padding: 'var(--ms-space-4)',
          borderRadius: 'var(--ms-radius-md)',
          border: '1px solid var(--ms-color-border)',
        }}
      >
        <VisuallyHidden as="h2">近期通知</VisuallyHidden>
        <span style={{ color: 'var(--ms-color-fg)' }}>· 你的工作区已同步完成</span>
        <span style={{ color: 'var(--ms-color-fg)' }}>· 本月账单已生成</span>
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>
          该区块有隐藏的 &lt;h2&gt;「近期通知」,SR 可按标题跳转。
        </small>
      </section>
    </div>
  );
}
