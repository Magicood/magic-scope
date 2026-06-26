import { VisuallyHidden } from '@magic-scope/react';

export default function Demo() {
  // focusable:skip-link 模式 —— 平时隐身,键盘 Tab 聚焦时浮现还原可见。
  // 注意元素本身须可聚焦(这里是 <a href>),否则 :focus 永不命中。
  // 试:点下面的占位区,再按 Tab,顶部会浮出「跳到主内容」链接。
  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gap: 'var(--ms-space-4)',
        padding: 'var(--ms-space-5)',
        borderRadius: 'var(--ms-radius-lg)',
        border: '1px solid var(--ms-color-border)',
        background: 'var(--ms-color-bg-subtle)',
      }}
    >
      <VisuallyHidden as="a" href="#main-content" focusable>
        跳到主内容
      </VisuallyHidden>

      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        点这段区域,再按 Tab —— 隐藏的「跳到主内容」会从左上角浮现并可见。
      </small>

      <button
        type="button"
        style={{
          justifySelf: 'start',
          padding: 'var(--ms-space-2) var(--ms-space-4)',
          borderRadius: 'var(--ms-radius-md)',
          border: '1px solid var(--ms-color-border)',
          background: 'var(--ms-color-bg)',
          color: 'var(--ms-color-fg)',
          cursor: 'pointer',
        }}
      >
        占位可聚焦元素
      </button>

      <p id="main-content" style={{ margin: 0, color: 'var(--ms-color-fg)' }}>
        这里是主内容区(skip-link 的锚点)。
      </p>
    </div>
  );
}
